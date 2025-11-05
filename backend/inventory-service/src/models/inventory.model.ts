import { ObjectType, Field, ID, Float, Directive } from '@nestjs/graphql';
import { Product } from './product.model';

@ObjectType({ description: '재고 항목' })
@Directive('@key(fields: "storeId sku")')
export class InventoryItem {
  @Field(() => ID)
  storeId!: string;

  @Field(() => ID)
  sku!: string;

  @Field(() => Float, { description: '현재 재고 수량' })
  quantityOnHand!: number;

  @Field(() => Float, { description: '예약된 수량' })
  reserved!: number;

  @Field(() => Float, { description: '안전재고 임계치' })
  reorderPoint!: number;

  @Field({ nullable: true, description: '마지막 실사 일시' })
  lastAuditAt?: string;

  @Field()
  updatedAt!: string;

  // Federation 확장: Product 참조
  @Field(() => Product, { nullable: true })
  product?: Product;
}

@ObjectType({ description: '재고 실사 이력' })
export class InventoryAudit {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  storeId!: string;

  @Field(() => ID)
  sku!: string;

  @Field(() => Float)
  previousQuantity!: number;

  @Field(() => Float)
  newQuantity!: number;

  @Field({ description: 'ISO-8601' })
  auditDate!: string;

  @Field(() => ID, { description: '실사 수행자 ID' })
  performedBy!: string;

  @Field({ nullable: true })
  notes?: string;
}

@ObjectType({ description: '리오더 추천' })
export class ReorderRecommendation {
  @Field(() => ID)
  storeId!: string;

  @Field(() => ID)
  sku!: string;

  @Field()
  productName!: string;

  @Field(() => Float)
  currentQuantity!: number;

  @Field(() => Float)
  reorderPoint!: number;

  @Field(() => Float, { description: '추천 발주 수량' })
  recommendedQuantity!: number;

  @Field(() => Float, { description: '우선순위 (낮을수록 높음)' })
  priority!: number;

  @Field({ description: '긴급도 (HIGH, MEDIUM, LOW)' })
  urgency!: string;
}
