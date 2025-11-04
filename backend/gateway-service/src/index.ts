import cors from 'cors';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';

async function bootstrap() {
  const port = Number(process.env.PORT ?? 4000);

  const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: [
        { name: 'attendance', url: 'http://localhost:4001/graphql' },
        { name: 'inventory', url: 'http://localhost:4002/graphql' },
        { name: 'sales', url: 'http://localhost:4003/graphql' },
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
    }),
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


