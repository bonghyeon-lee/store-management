import { Query, Resolver, Args, Mutation, ID } from '@nestjs/graphql';
import {
  Order,
  OrderStatus,
  DailySales,
  WeeklySales,
  MonthlySales,
  SalesDashboard,
  RecordLineItemInput,
  RecordSaleInput,
} from '../models/sales.model';
import { SalesService } from '../services/sales.service';

@Resolver(() => Order)
export class SalesResolver {
  constructor(private readonly salesService: SalesService) {}

  @Query(() => Order, { nullable: true, description: '주문 조회' })
  order(
    @Args('storeId', { type: () => ID }) storeId: string,
    @Args('orderId', { type: () => ID }) orderId: string
  ): Promise<Order | null> {
    return this.salesService.getOrder(storeId, orderId);
  }

  @Query(() => [Order], { description: '주문 목록 조회' })
  orders(
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
    @Args('storeId', { type: () => ID, nullable: true }) storeId?: string,
    @Args('channel', { nullable: true }) channel?: string,
    @Args('status', { type: () => OrderStatus, nullable: true })
    status?: OrderStatus
  ): Promise<Order[]> {
    return this.salesService.getOrders(
      startDate,
      endDate,
      storeId,
      channel,
      status
    );
  }

  @Mutation(() => Order, { description: '매출 기록 (단일)' })
  recordSale(
    @Args('storeId', { type: () => ID }) storeId: string,
    @Args('orderId', { type: () => ID }) orderId: string,
    @Args('currency') currency: string,
    @Args('channel') channel: string,
    @Args('lineItems', { type: () => [RecordLineItemInput] })
    lineItems: RecordLineItemInput[],
    @Args('settledAt', { nullable: true }) settledAt?: string
  ): Promise<Order> {
    return this.salesService.recordSale(
      storeId,
      orderId,
      currency,
      channel,
      lineItems,
      settledAt
    );
  }

  @Mutation(() => [Order], { description: '매출 기록 (배치)' })
  recordSalesBatch(
    @Args('sales', { type: () => [RecordSaleInput] }) sales: RecordSaleInput[]
  ): Promise<Order[]> {
    return this.salesService.recordSalesBatch(sales);
  }

  @Mutation(() => Order, { description: '주문 환불' })
  refundOrder(
    @Args('storeId', { type: () => ID }) storeId: string,
    @Args('orderId', { type: () => ID }) orderId: string,
    @Args('amount') amount: number
  ): Promise<Order> {
    return this.salesService.refundOrder(storeId, orderId, amount);
  }

  @Query(() => DailySales, { description: '일별 매출 집계' })
  dailySales(
    @Args('date', { description: 'YYYY-MM-DD' }) date: string,
    @Args('storeId', { type: () => ID, nullable: true }) storeId?: string
  ): Promise<DailySales> {
    return this.salesService.getDailySales(date, storeId);
  }

  @Query(() => WeeklySales, { description: '주별 매출 집계' })
  weeklySales(
    @Args('weekStart', { description: 'YYYY-MM-DD (주 시작일)' })
    weekStart: string,
    @Args('storeId', { type: () => ID, nullable: true }) storeId?: string
  ): Promise<WeeklySales> {
    return this.salesService.getWeeklySales(weekStart, storeId);
  }

  @Query(() => MonthlySales, { description: '월별 매출 집계' })
  monthlySales(
    @Args('year') year: number,
    @Args('month') month: number,
    @Args('storeId', { type: () => ID, nullable: true }) storeId?: string
  ): Promise<MonthlySales> {
    return this.salesService.getMonthlySales(year, month, storeId);
  }

  @Query(() => SalesDashboard, { description: '매출 대시보드' })
  salesDashboard(
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
    @Args('storeId', { type: () => ID, nullable: true }) storeId?: string
  ): Promise<SalesDashboard> {
    return this.salesService.getSalesDashboard(startDate, endDate, storeId);
  }
}
