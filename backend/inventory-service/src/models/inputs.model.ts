import { InputType, Field, ID, Float } from '@nestjs/graphql';

@InputType()
export class CreateSKUInput {
  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float)
  unitPrice!: number;

  @Field({ nullable: true })
  category?: string;
}

@InputType()
export class UpdateSKUInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  unitPrice?: number;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  isActive?: boolean;
}

@InputType()
export class SubmitInventoryCountInput {
  @Field(() => ID)
  storeId!: string;

  @Field(() => ID)
  sku!: string;

  @Field(() => Float, { description: '실사 수량' })
  quantity!: number;

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class SetReorderPointInput {
  @Field(() => ID)
  storeId!: string;

  @Field(() => ID)
  sku!: string;

  @Field(() => Float)
  reorderPoint!: number;
}

@InputType()
export class CreatePurchaseOrderInput {
  @Field(() => ID)
  storeId!: string;

  @Field(() => ID)
  sku!: string;

  @Field(() => Float)
  requestedQuantity!: number;

  @Field({ nullable: true })
  notes?: string;
}
