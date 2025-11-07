import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryResolver } from '../resolvers/inventory.resolver';
import { ProductResolver } from '../resolvers/product.resolver';
import { PurchaseOrderResolver } from '../resolvers/purchase-order.resolver';
import { ProductEntity } from '../entities/product.entity';
import { InventoryItemEntity } from '../entities/inventory-item.entity';
import { InventoryAuditEntity } from '../entities/inventory-audit.entity';
import { PurchaseOrderEntity } from '../entities/purchase-order.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url:
        process.env.DATABASE_URL ||
        'postgresql://storeuser:storepass@localhost:5432/storemanagement',
      entities: [
        ProductEntity,
        InventoryItemEntity,
        InventoryAuditEntity,
        PurchaseOrderEntity,
      ],
      synchronize: process.env.NODE_ENV !== 'production', // 개발 환경에서만 자동 동기화
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([
      ProductEntity,
      InventoryItemEntity,
      InventoryAuditEntity,
      PurchaseOrderEntity,
    ]),
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
  providers: [InventoryResolver, ProductResolver, PurchaseOrderResolver],
})
export class AppModule {}
