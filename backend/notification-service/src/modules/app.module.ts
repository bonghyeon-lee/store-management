import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationResolver } from '../resolvers/notification.resolver';
import { NotificationEntity } from '../entities/notification.entity';
import { NotificationTemplateEntity } from '../entities/template.entity';
import { EmailService } from '../services/email.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url:
        process.env.DATABASE_URL ||
        'postgresql://storeuser:storepass@localhost:5432/storemanagement',
      entities: [NotificationEntity, NotificationTemplateEntity],
      synchronize: process.env.NODE_ENV !== 'production', // 개발 환경에서만 자동 동기화
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([NotificationEntity, NotificationTemplateEntity]),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        path: 'schema.gql',
        federation: 2,
      },
      playground: true,
      sortSchema: true,
    }),
  ],
  providers: [NotificationResolver, EmailService],
})
export class AppModule {}

