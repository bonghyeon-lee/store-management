import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum AttendanceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

registerEnumType(AttendanceStatus, {
  name: 'AttendanceStatus',
});

@ObjectType({ description: '출퇴근 기록' })
export class Attendance {
  @Field(() => ID)
  storeId!: string;

  @Field(() => ID)
  employeeId!: string;

  @Field({ description: 'ISO-8601 (YYYY-MM-DD)' })
  date!: string;

  @Field({ nullable: true })
  checkInAt?: string;

  @Field({ nullable: true })
  checkOutAt?: string;

  @Field(() => AttendanceStatus)
  status!: AttendanceStatus;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true, description: '근무 시간 (시간 단위)' })
  workingHours?: number;
}
