import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceResolver } from '../resolvers/attendance.resolver';
import { EmployeeResolver } from '../resolvers/employee.resolver';
import { ReportResolver } from '../resolvers/report.resolver';
import { EmployeeEntity } from '../entities/employee.entity';
import { AttendanceEntity } from '../entities/attendance.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url:
        process.env.DATABASE_URL ||
        'postgresql://storeuser:storepass@localhost:5432/storemanagement',
      entities: [EmployeeEntity, AttendanceEntity],
      synchronize: process.env.NODE_ENV !== 'production', // 개발 환경에서만 자동 동기화
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([EmployeeEntity, AttendanceEntity]),
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
