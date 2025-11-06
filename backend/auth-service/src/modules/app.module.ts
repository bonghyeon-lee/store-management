import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { AuthResolver } from '../resolvers/auth.resolver';
import { RoleResolver } from '../resolvers/role.resolver';
import { PermissionService } from '../services/permission.service';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';

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
      context: ({ req }: { req: any }) => ({ req }),
    }),
  ],
  providers: [
    AuthResolver,
    RoleResolver,
    PermissionService,
    AuthGuard,
    RolesGuard,
  ],
})
export class AppModule {}

