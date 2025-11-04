import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 헬스 체크 엔드포인트
  app.getHttpAdapter().get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'auth-service',
    });
  });

  const port = process.env.PORT || 4005;
  await app.listen(port as number);
  // eslint-disable-next-line no-console
  console.log(
    `Auth subgraph running on http://localhost:${port}/graphql`
  );
  // eslint-disable-next-line no-console
  console.log(`Health check available at http://localhost:${port}/health`);
}

bootstrap();

