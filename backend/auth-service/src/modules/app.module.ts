import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { AuthResolver } from '../resolvers/auth.resolver';

@Module({
  imports: [
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
  providers: [AuthResolver],
})
export class AppModule {}

