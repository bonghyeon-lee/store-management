import cors from 'cors';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';

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
    // Apollo Server v4에서는 schema가 gateway에서 제공되며, 별도 plugins나 csrf 설정은 미들웨어 단계에서 처리
  });

  await server.start();

  const app = express();
  app.use(cors({ origin: true, credentials: true }));

  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      context: async () => ({}),
    }) as express.RequestHandler
  );

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Gateway running at http://localhost:${port}/graphql`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start gateway:', err);
  process.exit(1);
});
