import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

/**
 * 보안 헤더 설정
 */
export function securityHeadersMiddleware() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  });
}

/**
 * Rate Limiting 설정
 */
export function createRateLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15분
    max: 100, // 최대 100개 요청
    message: {
      errors: [
        {
          message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
          extensions: {
            code: 'RATE_LIMIT_EXCEEDED',
          },
        },
      ],
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

/**
 * GraphQL Introspection 제어 (프로덕션 환경)
 */
export function introspectionControlMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const allowIntrospection = process.env.ALLOW_INTROSPECTION === 'true';

  if (isProduction && !allowIntrospection) {
    const body = req.body as { query?: string } | undefined;
    const query = body?.query ?? '';

    // Introspection 쿼리 차단
    if (
      query.includes('__schema') ||
      query.includes('__type') ||
      query.includes('IntrospectionQuery')
    ) {
      res.status(403).json({
        errors: [
          {
            message: 'Introspection은 프로덕션 환경에서 비활성화되어 있습니다.',
            extensions: {
              code: 'INTROSPECTION_DISABLED',
            },
          },
        ],
      });
      return;
    }
  }

  next();
}
