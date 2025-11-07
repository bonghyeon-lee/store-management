import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesResolver } from '../resolvers/sales.resolver';
import { SalesService } from '../services/sales.service';
import { OrderEntity } from '../entities/order.entity';
import { LineItemEntity } from '../entities/line-item.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url:
        process.env.DATABASE_URL ||
        'postgresql://storeuser:storepass@localhost:5432/storemanagement',
      entities: [OrderEntity, LineItemEntity],
      synchronize: process.env.NODE_ENV !== 'production', // 개발 환경에서만 자동 동기화
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([OrderEntity, LineItemEntity]),
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
  providers: [SalesResolver, SalesService],
})
export class AppModule {}
