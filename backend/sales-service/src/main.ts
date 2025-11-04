import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 4003;
  await app.listen(port as number);
  // eslint-disable-next-line no-console
  console.log(`Sales subgraph running on http://localhost:${port}/graphql`);
}

bootstrap();


