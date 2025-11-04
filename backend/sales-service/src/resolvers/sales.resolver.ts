import { Query, Resolver, Args, Mutation } from '@nestjs/graphql';
import {
  Order,
  OrderStatus,
  LineItem,
  DailySales,
  WeeklySales,
  MonthlySales,
  SalesDashboard,
  StoreSalesSummary,
  RecordLineItemInput,
  RecordSaleInput,
} from '../models/sales.model';

// 인메모리 데이터 저장소 (MVP 단계)
const orders: Map<string, Order> = new Map();

// 키 생성 함수
const getOrderKey = (storeId: string, orderId: string) =>
  `${storeId}:${orderId}`;

// 주 시작일 계산 (월요일 기준)
const getWeekStart = (date: string): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
};

// 주 종료일 계산 (일요일)
const getWeekEnd = (date: string): string => {
  const weekStart = getWeekStart(date);
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  return d.toISOString().split('T')[0];
};

// 일주일의 모든 날짜 반환
const getWeekDates = (weekStart: string): string[] => {
  const dates: string[] = [];
  const start = new Date(weekStart);
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

// 월의 모든 날짜 반환
const getMonthDates = (year: number, month: number): string[] => {
  const dates: string[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(
      day
    ).padStart(2, '0')}`;
    dates.push(dateStr);
  }
  return dates;
};

// 전주 시작일 계산
const getPreviousWeekStart = (weekStart: string): string => {
  const d = new Date(weekStart);
  d.setDate(d.getDate() - 7);
  return d.toISOString().split('T')[0];
};

// 전월 계산
const getPreviousMonth = (
  year: number,
  month: number
): { year: number; month: number } => {
  if (month === 1) {
    return { year: year - 1, month: 12 };
  }
  return { year, month: month - 1 };
};

@Resolver(() => Order)
export class SalesResolver {
  @Query(() => Order, { nullable: true, description: '주문 조회' })
  order(
    @Args('storeId') storeId: string,
    @Args('orderId') orderId: string
  ): Order | null {
    const key = getOrderKey(storeId, orderId);
    return orders.get(key) || null;
  }

  @Query(() => [Order], { description: '주문 목록 조회' })
  orders(
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
    @Args('storeId', { nullable: true }) storeId?: string,
    @Args('channel', { nullable: true }) channel?: string,
    @Args('status', { type: () => OrderStatus, nullable: true })
    status?: OrderStatus
  ): Order[] {
    let result = Array.from(orders.values());

    result = result.filter((order) => {
      const orderDate = order.createdAt.split('T')[0];
      return orderDate >= startDate && orderDate <= endDate;
    });

    if (storeId) {
      result = result.filter((order) => order.storeId === storeId);
    }

    if (channel) {
      result = result.filter((order) => order.channel === channel);
    }

    if (status) {
      result = result.filter((order) => order.status === status);
    }

    return result;
  }

  @Mutation(() => Order, { description: '매출 기록 (단일)' })
  recordSale(
    @Args('storeId') storeId: string,
    @Args('orderId') orderId: string,
    @Args('currency') currency: string,
    @Args('channel') channel: string,
    @Args('lineItems', { type: () => [RecordLineItemInput] })
    lineItems: RecordLineItemInput[],
    @Args('settledAt', { nullable: true }) settledAt?: string
  ): Order {
    const items: LineItem[] = lineItems.map((li) => ({
      ...li,
      subtotal: li.unitPrice * li.quantity,
    }));
    const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);
    const now = new Date().toISOString();

    const order: Order = {
      storeId,
      orderId,
      createdAt: now,
      settledAt: settledAt || now,
      totalAmount,
      currency,
      status: OrderStatus.PAID,
      channel,
      lineItems: items,
    };

    const key = getOrderKey(storeId, orderId);
    orders.set(key, order);
    return order;
  }

  @Mutation(() => [Order], { description: '매출 기록 (배치)' })
  recordSalesBatch(
    @Args('sales', { type: () => [RecordSaleInput] }) sales: RecordSaleInput[]
  ): Order[] {
    return sales.map((sale) => {
      const items: LineItem[] = sale.lineItems.map((li) => ({
        ...li,
        subtotal: li.unitPrice * li.quantity,
      }));
      const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);
      const now = new Date().toISOString();

      const order: Order = {
        storeId: sale.storeId,
        orderId: sale.orderId,
        createdAt: now,
        settledAt: sale.settledAt || now,
        totalAmount,
        currency: sale.currency,
        status: OrderStatus.PAID,
        channel: sale.channel,
        lineItems: items,
      };

      const key = getOrderKey(sale.storeId, sale.orderId);
      orders.set(key, order);
      return order;
    });
  }

  @Mutation(() => Order, { description: '주문 환불' })
  refundOrder(
    @Args('storeId') storeId: string,
    @Args('orderId') orderId: string,
    @Args('amount') amount: number
  ): Order {
    const key = getOrderKey(storeId, orderId);
    const existing = orders.get(key);

    if (!existing) {
      throw new Error('주문을 찾을 수 없습니다.');
    }

    const refunded: Order = {
      ...existing,
      status: OrderStatus.REFUNDED,
      totalAmount: -Math.abs(amount),
      lineItems: [],
    };

    orders.set(key, refunded);
    return refunded;
  }

  @Query(() => DailySales, { description: '일별 매출 집계' })
  dailySales(
    @Args('date', { description: 'YYYY-MM-DD' }) date: string,
    @Args('storeId', { nullable: true }) storeId?: string
  ): DailySales {
    const ordersList = Array.from(orders.values());
    let filtered = ordersList.filter((order) => {
      const orderDate = order.createdAt.split('T')[0];
      return orderDate === date && order.status === OrderStatus.PAID;
    });

    if (storeId) {
      filtered = filtered.filter((order) => order.storeId === storeId);
    }

    const totalSales = filtered.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const transactionCount = filtered.length;
    const averageTransactionValue =
      transactionCount > 0 ? totalSales / transactionCount : 0;

    // 채널별 집계
    const channelMap = new Map<string, { totalSales: number; count: number }>();
    filtered.forEach((order) => {
      const existing = channelMap.get(order.channel) || {
        totalSales: 0,
        count: 0,
      };
      existing.totalSales += order.totalAmount;
      existing.count += 1;
      channelMap.set(order.channel, existing);
    });

    const channelBreakdown = Array.from(channelMap.entries()).map(
      ([channel, data]) => ({
        channel,
        totalSales: data.totalSales,
        transactionCount: data.count,
      })
    );

    return {
      date,
      storeId,
      totalSales: Math.round(totalSales * 100) / 100,
      transactionCount,
      averageTransactionValue: Math.round(averageTransactionValue * 100) / 100,
      channelBreakdown,
    };
  }

  @Query(() => WeeklySales, { description: '주별 매출 집계' })
  weeklySales(
    @Args('weekStart', { description: 'YYYY-MM-DD (주 시작일)' })
    weekStart: string,
    @Args('storeId', { nullable: true }) storeId?: string
  ): WeeklySales {
    const weekEnd = getWeekEnd(weekStart);
    const weekDates = getWeekDates(weekStart);
    const previousWeekStart = getPreviousWeekStart(weekStart);

    // 주간 데이터 집계
    const dailySalesList: DailySales[] = weekDates.map((date) =>
      this.dailySales(date, storeId)
    );

    const totalSales = dailySalesList.reduce(
      (sum, daily) => sum + daily.totalSales,
      0
    );
    const transactionCount = dailySalesList.reduce(
      (sum, daily) => sum + daily.transactionCount,
      0
    );
    const averageTransactionValue =
      transactionCount > 0 ? totalSales / transactionCount : 0;

    // 전주 데이터
    const previousWeekDailySales = this.dailySales(previousWeekStart, storeId);
    const previousWeekSales = previousWeekDailySales.totalSales;
    const growthRate =
      previousWeekSales > 0
        ? ((totalSales - previousWeekSales) / previousWeekSales) * 100
        : null;

    return {
      weekStart,
      weekEnd,
      storeId,
      totalSales: Math.round(totalSales * 100) / 100,
      transactionCount,
      averageTransactionValue: Math.round(averageTransactionValue * 100) / 100,
      previousWeekSales,
      growthRate: growthRate ? Math.round(growthRate * 100) / 100 : undefined,
      dailySales: dailySalesList,
    };
  }

  @Query(() => MonthlySales, { description: '월별 매출 집계' })
  monthlySales(
    @Args('year') year: number,
    @Args('month') month: number,
    @Args('storeId', { nullable: true }) storeId?: string
  ): MonthlySales {
    const monthDates = getMonthDates(year, month);
    const previousMonth = getPreviousMonth(year, month);

    // 월간 데이터 집계
    const dailySalesList: DailySales[] = monthDates.map((date) =>
      this.dailySales(date, storeId)
    );

    const totalSales = dailySalesList.reduce(
      (sum, daily) => sum + daily.totalSales,
      0
    );
    const transactionCount = dailySalesList.reduce(
      (sum, daily) => sum + daily.transactionCount,
      0
    );
    const averageTransactionValue =
      transactionCount > 0 ? totalSales / transactionCount : 0;

    // 전월 데이터 (간단히 전월 첫날 데이터로 계산)
    const previousMonthFirstDay = `${previousMonth.year}-${String(
      previousMonth.month
    ).padStart(2, '0')}-01`;
    const previousMonthDailySales = this.dailySales(
      previousMonthFirstDay,
      storeId
    );
    const previousMonthSales = previousMonthDailySales.totalSales;
    const growthRate =
      previousMonthSales > 0
        ? ((totalSales - previousMonthSales) / previousMonthSales) * 100
        : null;

    return {
      year,
      month,
      storeId,
      totalSales: Math.round(totalSales * 100) / 100,
      transactionCount,
      averageTransactionValue: Math.round(averageTransactionValue * 100) / 100,
      previousMonthSales,
      growthRate: growthRate ? Math.round(growthRate * 100) / 100 : undefined,
      dailySales: dailySalesList,
    };
  }

  @Query(() => SalesDashboard, { description: '매출 대시보드' })
  salesDashboard(
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
    @Args('storeId', { nullable: true }) storeId?: string
  ): SalesDashboard {
    const ordersList = Array.from(orders.values());
    let filtered = ordersList.filter((order) => {
      const orderDate = order.createdAt.split('T')[0];
      return (
        orderDate >= startDate &&
        orderDate <= endDate &&
        order.status === OrderStatus.PAID
      );
    });

    if (storeId) {
      filtered = filtered.filter((order) => order.storeId === storeId);
    }

    const totalSales = filtered.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const totalTransactions = filtered.length;
    const averageTransactionValue =
      totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // 지점별 집계
    const storeMap = new Map<string, { totalSales: number; count: number }>();
    filtered.forEach((order) => {
      const existing = storeMap.get(order.storeId) || {
        totalSales: 0,
        count: 0,
      };
      existing.totalSales += order.totalAmount;
      existing.count += 1;
      storeMap.set(order.storeId, existing);
    });

    const storeSummary: StoreSalesSummary[] = Array.from(
      storeMap.entries()
    ).map(([storeId, data]) => ({
      storeId,
      totalSales: Math.round(data.totalSales * 100) / 100,
      transactionCount: data.count,
      averageTransactionValue:
        Math.round((data.totalSales / data.count) * 100) / 100,
    }));

    // 상위/하위 지점
    const sortedStores = [...storeSummary].sort(
      (a, b) => b.totalSales - a.totalSales
    );
    const topStores = sortedStores.slice(0, 5);
    const bottomStores = sortedStores.slice(-5).reverse();

    // 채널별 분포
    const channelMap = new Map<string, { totalSales: number; count: number }>();
    filtered.forEach((order) => {
      const existing = channelMap.get(order.channel) || {
        totalSales: 0,
        count: 0,
      };
      existing.totalSales += order.totalAmount;
      existing.count += 1;
      channelMap.set(order.channel, existing);
    });

    const channelDistribution = Array.from(channelMap.entries()).map(
      ([channel, data]) => ({
        channel,
        totalSales: Math.round(data.totalSales * 100) / 100,
        transactionCount: data.count,
      })
    );

    // 기간별 트렌드 (일별)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const trendDates: string[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      trendDates.push(d.toISOString().split('T')[0]);
    }

    const trend: DailySales[] = trendDates.map((date) =>
      this.dailySales(date, storeId)
    );

    return {
      period: `${startDate} ~ ${endDate}`,
      totalSales: Math.round(totalSales * 100) / 100,
      totalTransactions,
      averageTransactionValue: Math.round(averageTransactionValue * 100) / 100,
      storeSummary,
      topStores,
      bottomStores,
      channelDistribution,
      trend,
    };
  }
}
