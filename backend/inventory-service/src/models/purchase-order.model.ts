import {
  ObjectType,
  Field,
  ID,
  registerEnumType,
  Float,
  Directive,
} from '@nestjs/graphql';

export enum PurchaseOrderStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RECEIVED = 'RECEIVED',
}

registerEnumType(PurchaseOrderStatus, {
  name: 'PurchaseOrderStatus',
});

@ObjectType({ description: '발주' })
@Directive('@key(fields: "id")')
export class PurchaseOrder {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  storeId!: string;

  @Field(() => ID)
  sku!: string;

  @Field(() => Float, { description: '요청 수량' })
  requestedQuantity!: number;

  @Field(() => Float, { nullable: true, description: '승인된 수량' })
  approvedQuantity?: number;

  @Field(() => Float, { nullable: true, description: '입고된 수량' })
  receivedQuantity?: number;

  @Field(() => PurchaseOrderStatus)
  status!: PurchaseOrderStatus;

  @Field(() => ID, { description: '발주 요청자 ID' })
  requestedBy!: string;

  @Field(() => ID, { nullable: true, description: '승인자 ID' })
  approvedBy?: string;

  @Field({ description: 'ISO-8601' })
  requestedAt!: string;

  @Field({ nullable: true, description: 'ISO-8601' })
  approvedAt?: string;

  @Field({ nullable: true, description: 'ISO-8601' })
  receivedAt?: string;

  @Field({ nullable: true })
  notes?: string;
}
