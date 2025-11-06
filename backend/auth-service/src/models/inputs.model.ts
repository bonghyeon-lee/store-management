import { InputType, Field } from '@nestjs/graphql';
import { UserRole } from './user.model';

@InputType()
export class RegisterUserInput {
  @Field()
  email!: string;

  @Field()
  password!: string;

  @Field()
  name!: string;

  @Field(() => UserRole)
  role!: UserRole;

  @Field({ nullable: true })
  storeId?: string;
}

@InputType()
export class LoginInput {
  @Field()
  email!: string;

  @Field()
  password!: string;
}

@InputType()
export class AssignRoleInput {
  @Field(() => String)
  userId!: string;

  @Field(() => String)
  roleId!: string;
}

