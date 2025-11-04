import { InputType, Field, ID } from '@nestjs/graphql';
import { EmploymentStatus } from './employee.model';

@InputType()
export class CreateEmployeeInput {
  @Field()
  name!: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field()
  role!: string;

  @Field(() => [ID])
  assignedStoreIds!: string[];
}

@InputType()
export class UpdateEmployeeInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  role?: string;

  @Field(() => EmploymentStatus, { nullable: true })
  employmentStatus?: EmploymentStatus;

  @Field(() => [ID], { nullable: true })
  assignedStoreIds?: string[];
}

@InputType()
export class CheckInInput {
  @Field(() => ID)
  storeId!: string;

  @Field(() => ID)
  employeeId!: string;

  @Field({ description: 'ISO-8601 (YYYY-MM-DD)' })
  date!: string;

  @Field({ description: 'ISO-8601 (YYYY-MM-DDTHH:mm:ss)' })
  checkInAt!: string;

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class CheckOutInput {
  @Field(() => ID)
  storeId!: string;

  @Field(() => ID)
  employeeId!: string;

  @Field({ description: 'ISO-8601 (YYYY-MM-DD)' })
  date!: string;

  @Field({ description: 'ISO-8601 (YYYY-MM-DDTHH:mm:ss)' })
  checkOutAt!: string;

  @Field({ nullable: true })
  notes?: string;
}
