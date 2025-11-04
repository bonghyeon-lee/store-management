import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { AttendanceResolver } from '../resolvers/attendance.resolver';
import { EmployeeResolver } from '../resolvers/employee.resolver';
import { ReportResolver } from '../resolvers/report.resolver';

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
  providers: [AttendanceResolver, EmployeeResolver, ReportResolver],
})
export class AppModule {}
