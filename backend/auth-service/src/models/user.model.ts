import { ObjectType, Field, ID, registerEnumType, Directive } from '@nestjs/graphql';

export enum UserRole {
  HQ_ADMIN = 'HQ_ADMIN',
  STORE_MANAGER = 'STORE_MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}

registerEnumType(UserRole, {
  name: 'UserRole',
});

@ObjectType({ description: '사용자' })
@Directive('@key(fields: "id")')
export class User {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field()
  name!: string;

  @Field(() => UserRole)
  role!: UserRole;

  @Field(() => ID, { nullable: true })
  storeId?: string;

  @Field()
  createdAt!: string;

  @Field({ nullable: true })
  lastLoginAt?: string;
}

@ObjectType({ description: '인증 토큰' })
export class AuthToken {
  @Field()
  accessToken!: string;

  @Field()
  refreshToken!: string;

  @Field(() => User)
  user!: User;
}

