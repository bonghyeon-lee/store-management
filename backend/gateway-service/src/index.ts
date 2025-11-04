import cors from 'cors';
import express, { Request } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import {
  authMiddleware,
  AuthenticatedRequest,
} from './middleware/auth.middleware';
import {
  requestIdMiddleware,
  errorLoggingMiddleware,
  RequestWithId,
} from './middleware/observability.middleware';
import {
  securityHeadersMiddleware,
  createRateLimiter,
  introspectionControlMiddleware,
} from './middleware/security.middleware';

async function bootstrap() {
  const port = Number(process.env.PORT ?? 4000);

  const attendanceUrl =
    process.env.ATTENDANCE_URL ?? 'http://localhost:4001/graphql';
  const inventoryUrl =
    process.env.INVENTORY_URL ?? 'http://localhost:4002/graphql';
  const salesUrl = process.env.SALES_URL ?? 'http://localhost:4003/graphql';

  async function waitForUrl(url: string, attempts = 30, delayMs = 2000) {
    for (let i = 0; i < attempts; i++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ query: 'query{__typename}' }),
        });
        if (res.ok) return;
      } catch {
        // ignore and retry
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
    throw new Error(`Subgraph not reachable: ${url}`);
  }

  await Promise.all([
    waitForUrl(attendanceUrl),
    waitForUrl(inventoryUrl),
    waitForUrl(salesUrl),
  ]);

  const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: [
        { name: 'attendance', url: attendanceUrl },
        { name: 'inventory', url: inventoryUrl },
        { name: 'sales', url: salesUrl },
      ],
    }),
  });

  const server = new ApolloServer({
    gateway,
    formatError: (formattedError, error) => {
      // GraphQL 에러 포맷팅
      const extensions = formattedError.extensions || {};

      return {
        message: formattedError.message,
        extensions: {
          ...extensions,
          code: extensions.code || 'INTERNAL_ERROR',
          timestamp: new Date().toISOString(),
        },
      };
    },
  });

  await server.start();

  const app = express();

  // Trust proxy (rate limiting을 위해)
  app.set('trust proxy', 1);

  // 보안 헤더 설정
  app.use(securityHeadersMiddleware());

  // CORS 설정 (프론트엔드 도메인 허용)
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:5173'];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('CORS 정책에 의해 차단되었습니다.'));
        }
      },
      credentials: true,
    })
  );

  // 요청 ID 및 로깅 미들웨어
  app.use(requestIdMiddleware);

  // Rate Limiting
  app.use('/graphql', createRateLimiter());

  // 헬스 체크 엔드포인트
  app.get('/health', (_req: Request, res: any) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'gateway',
    });
  });

  app.get('/healthz', (_req: Request, res: any) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'gateway',
    });
  });

  // GraphQL Introspection 제어
  app.use(introspectionControlMiddleware);

  // JWT 인증 미들웨어
  app.use(authMiddleware);

  // GraphQL 엔드포인트
  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      context: async ({
        req,
      }: {
        req: AuthenticatedRequest & RequestWithId;
      }) => {
        // 요청 컨텍스트에 사용자 정보 및 요청 ID 주입
        return {
          user: req.user,
          requestId: req.requestId,
        };
      },
    }) as express.RequestHandler
  );

  // 에러 로깅 미들웨어 (마지막에 위치)
  app.use(errorLoggingMiddleware);

  // 전역 에러 핸들러
  app.use((err: Error, req: Request, res: any, next: any) => {
    if (res.headersSent) {
      return next(err);
    }

    res.status(500).json({
      errors: [
        {
          message: '서버 내부 오류가 발생했습니다.',
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            timestamp: new Date().toISOString(),
          },
        },
      ],
    });
  });

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Gateway running at http://localhost:${port}/graphql`);
    // eslint-disable-next-line no-console
    console.log(`Health check available at http://localhost:${port}/health`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start gateway:', err);
  process.exit(1);
});
