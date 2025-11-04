import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { SalesResolver } from '../resolvers/sales.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      typePaths: [require.resolve('@schemas/sales.graphql')],
      playground: true,
      sortSchema: true,
    }),
  ],
  providers: [SalesResolver],
})
export class AppModule {}
