import { ObjectType, Field, ID, Directive } from '@nestjs/graphql';

@ObjectType({ description: '상품/SKU' })
@Directive('@key(fields: "id")')
export class Product {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Number, { description: '단가' })
  unitPrice!: number;

  @Field({ nullable: true })
  category?: string;

  @Field()
  isActive!: boolean;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
