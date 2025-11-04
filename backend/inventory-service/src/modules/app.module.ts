import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { InventoryResolver } from '../resolvers/inventory.resolver';
import { ProductResolver } from '../resolvers/product.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      typePaths: [require.resolve('@schemas/inventory.graphql')],
      playground: true,
      sortSchema: true,
    }),
  ],
  providers: [InventoryResolver, ProductResolver],
})
export class AppModule {}
