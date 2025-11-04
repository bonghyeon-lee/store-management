import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { AttendanceStatus } from './attendance.model';

@ObjectType()
export class EmployeeAttendanceStats {
  @Field(() => ID)
  employeeId!: string;

  @Field()
  employeeName!: string;

  @Field({ nullable: true })
  checkInAt?: string;

  @Field({ nullable: true })
  checkOutAt?: string;

  @Field(() => Float)
  workingHours!: number;

  @Field(() => AttendanceStatus)
  status!: AttendanceStatus;
}

@ObjectType({ description: '일별 근태 집계' })
export class DailyAttendanceReport {
  @Field()
  date!: string;

  @Field(() => ID, { nullable: true })
  storeId?: string;

  @Field(() => Float, { description: '출근률 (0-1)' })
  attendanceRate!: number;

  @Field(() => Float)
  lateCount!: number;

  @Field(() => Float)
  absentCount!: number;

  @Field(() => [EmployeeAttendanceStats])
  employeeStats!: EmployeeAttendanceStats[];
}

@ObjectType({ description: '주별 근태 집계' })
export class WeeklyAttendanceReport {
  @Field({ description: '주 시작일 (YYYY-MM-DD)' })
  weekStart!: string;

  @Field({ description: '주 종료일 (YYYY-MM-DD)' })
  weekEnd!: string;

  @Field(() => ID, { nullable: true })
  storeId?: string;

  @Field(() => Float)
  attendanceRate!: number;

  @Field(() => Float)
  averageWorkingHours!: number;

  @Field(() => Float)
  totalWorkingHours!: number;

  @Field(() => [DailyAttendanceReport])
  dailyReports!: DailyAttendanceReport[];
}
