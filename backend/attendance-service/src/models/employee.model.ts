import {
  ObjectType,
  Field,
  ID,
  registerEnumType,
  Directive,
} from '@nestjs/graphql';

export enum EmploymentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TERMINATED = 'TERMINATED',
}

registerEnumType(EmploymentStatus, {
  name: 'EmploymentStatus',
});

@ObjectType({ description: '직원' })
@Directive('@key(fields: "id")')
export class Employee {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field()
  role!: string;

  @Field(() => EmploymentStatus)
  employmentStatus!: EmploymentStatus;

  @Field(() => [ID])
  assignedStoreIds!: string[];

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
