import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { AttendanceResolver } from '../resolvers/attendance.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      typePaths: [require.resolve('@schemas/attendance.graphql')],
      playground: true,
      sortSchema: true,
    }),
  ],
  providers: [AttendanceResolver],
})
export class AppModule {}
