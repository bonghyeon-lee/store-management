import { ObjectType, Field, ID, registerEnumType, Directive } from '@nestjs/graphql';

export enum Permission {
  // 근태 관련 권한
  VIEW_ATTENDANCE = 'VIEW_ATTENDANCE',
  MANAGE_ATTENDANCE = 'MANAGE_ATTENDANCE',
  APPROVE_ATTENDANCE = 'APPROVE_ATTENDANCE',
  
  // 재고 관련 권한
  VIEW_INVENTORY = 'VIEW_INVENTORY',
  MANAGE_INVENTORY = 'MANAGE_INVENTORY',
  APPROVE_PURCHASE_ORDER = 'APPROVE_PURCHASE_ORDER',
  
  // 매출 관련 권한
  VIEW_SALES = 'VIEW_SALES',
  MANAGE_SALES = 'MANAGE_SALES',
  VIEW_SALES_REPORT = 'VIEW_SALES_REPORT',
  
  // 직원 관련 권한
  VIEW_EMPLOYEES = 'VIEW_EMPLOYEES',
  MANAGE_EMPLOYEES = 'MANAGE_EMPLOYEES',
  
  // 정책 관련 권한
  MANAGE_POLICIES = 'MANAGE_POLICIES',
  
  // 전체 조회 권한
  VIEW_ALL_STORES = 'VIEW_ALL_STORES',
}

registerEnumType(Permission, {
  name: 'Permission',
});

@ObjectType({ description: '역할' })
@Directive('@key(fields: "id")')
export class Role {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field(() => [Permission])
  permissions!: Permission[];

  @Field()
  createdAt!: string;

  @Field({ nullable: true })
  updatedAt?: string;
}

@ObjectType({ description: '사용자 역할 매핑' })
export class UserRole {
  @Field(() => ID)
  userId!: string;

  @Field(() => ID)
  roleId!: string;

  @Field(() => Role)
  role!: Role;

  @Field()
  assignedAt!: string;

  @Field({ nullable: true })
  assignedBy?: string;
}

