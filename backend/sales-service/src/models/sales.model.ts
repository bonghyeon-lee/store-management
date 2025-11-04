import {
  ObjectType,
  Field,
  ID,
  Float,
  registerEnumType,
  InputType,
} from '@nestjs/graphql';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
});

@ObjectType()
export class LineItem {
  @Field(() => ID)
  sku!: string;

  @Field()
  name!: string;

  @Field(() => Float)
  unitPrice!: number;

  @Field(() => Float)
  quantity!: number;

  @Field(() => Float)
  subtotal!: number;
}

@ObjectType({ description: '주문' })
export class Order {
  @Field(() => ID)
  storeId!: string;

  @Field(() => ID)
  orderId!: string;

  @Field()
  createdAt!: string;

  @Field({ nullable: true, description: '결제 완료 일시 (ISO-8601)' })
  settledAt?: string;

  @Field(() => Float)
  totalAmount!: number;

  @Field()
  currency!: string;

  @Field(() => OrderStatus)
  status!: OrderStatus;

  @Field({ description: '판매 채널 (POS, ONLINE, MOBILE 등)' })
  channel!: string;

  @Field(() => [LineItem])
  lineItems!: LineItem[];
}

@ObjectType()
export class ChannelSales {
  @Field()
  channel!: string;

  @Field(() => Float)
  totalSales!: number;

  @Field(() => Float)
  transactionCount!: number;
}

@ObjectType({ description: '일별 매출 집계' })
export class DailySales {
  @Field({ description: '날짜 (YYYY-MM-DD)' })
  date!: string;

  @Field(() => ID, { nullable: true })
  storeId?: string;

  @Field(() => Float, { description: '총 매출' })
  totalSales!: number;

  @Field(() => Float, { description: '거래 건수' })
  transactionCount!: number;

  @Field(() => Float, { description: '평균 거래액' })
  averageTransactionValue!: number;

  @Field(() => [ChannelSales], { description: '채널별 매출 분류' })
  channelBreakdown!: ChannelSales[];
}

@ObjectType({ description: '주별 매출 집계' })
export class WeeklySales {
  @Field({ description: '주 시작일 (YYYY-MM-DD)' })
  weekStart!: string;

  @Field({ description: '주 종료일 (YYYY-MM-DD)' })
  weekEnd!: string;

  @Field(() => ID, { nullable: true })
  storeId?: string;

  @Field(() => Float)
  totalSales!: number;

  @Field(() => Float)
  transactionCount!: number;

  @Field(() => Float)
  averageTransactionValue!: number;

  @Field(() => Float, { nullable: true, description: '전주 매출' })
  previousWeekSales?: number;

  @Field(() => Float, { nullable: true, description: '증감률 (전주 대비, %)' })
  growthRate?: number;

  @Field(() => [DailySales], { description: '일별 상세 데이터' })
  dailySales!: DailySales[];
}

@ObjectType({ description: '월별 매출 집계' })
export class MonthlySales {
  @Field()
  year!: number;

  @Field()
  month!: number;

  @Field(() => ID, { nullable: true })
  storeId?: string;

  @Field(() => Float)
  totalSales!: number;

  @Field(() => Float)
  transactionCount!: number;

  @Field(() => Float)
  averageTransactionValue!: number;

  @Field(() => Float, { nullable: true, description: '전월 매출' })
  previousMonthSales?: number;

  @Field(() => Float, { nullable: true, description: '증감률 (전월 대비, %)' })
  growthRate?: number;

  @Field(() => [DailySales], { description: '일별 상세 데이터' })
  dailySales!: DailySales[];
}

@ObjectType({ description: '지점별 매출 요약' })
export class StoreSalesSummary {
  @Field(() => ID)
  storeId!: string;

  @Field(() => Float)
  totalSales!: number;

  @Field(() => Float)
  transactionCount!: number;

  @Field(() => Float)
  averageTransactionValue!: number;
}

@ObjectType({ description: '매출 대시보드' })
export class SalesDashboard {
  @Field({ description: '기간 (YYYY-MM-DD ~ YYYY-MM-DD)' })
  period!: string;

  @Field(() => Float, { description: '총 매출' })
  totalSales!: number;

  @Field(() => Float, { description: '총 거래 건수' })
  totalTransactions!: number;

  @Field(() => Float, { description: '평균 거래액' })
  averageTransactionValue!: number;

  @Field(() => [StoreSalesSummary], { description: '지점별 요약' })
  storeSummary!: StoreSalesSummary[];

  @Field(() => [StoreSalesSummary], { description: '상위 성과 지점' })
  topStores!: StoreSalesSummary[];

  @Field(() => [StoreSalesSummary], { description: '하위 성과 지점' })
  bottomStores!: StoreSalesSummary[];

  @Field(() => [ChannelSales], { description: '채널별 매출 분포' })
  channelDistribution!: ChannelSales[];

  @Field(() => [DailySales], { description: '기간별 트렌드' })
  trend!: DailySales[];
}

@InputType()
export class RecordLineItemInput {
  @Field(() => ID)
  sku!: string;

  @Field()
  name!: string;

  @Field(() => Float)
  unitPrice!: number;

  @Field(() => Float)
  quantity!: number;
}

@InputType()
export class RecordSaleInput {
  @Field(() => ID)
  storeId!: string;

  @Field(() => ID)
  orderId!: string;

  @Field()
  currency!: string;

  @Field()
  channel!: string;

  @Field(() => [RecordLineItemInput])
  lineItems!: RecordLineItemInput[];

  @Field({ nullable: true, description: 'ISO-8601' })
  settledAt?: string;
}
