import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from '../entities/order.entity';
import { LineItemEntity } from '../entities/line-item.entity';
import {
  Order,
  OrderStatus,
  LineItem,
  DailySales,
  WeeklySales,
  MonthlySales,
  SalesDashboard,
  StoreSalesSummary,
  ChannelSales,
  RecordLineItemInput,
  RecordSaleInput,
} from '../models/sales.model';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>,
    @InjectRepository(LineItemEntity)
    private lineItemRepository: Repository<LineItemEntity>
  ) {}

  async getOrder(storeId: string, orderId: string): Promise<Order | null> {
    const order = await this.orderRepository.findOne({
      where: { storeId, orderId },
      relations: ['lineItems'],
    });

    if (!order) {
      return null;
    }

    return this.mapOrderEntityToOrder(order);
  }

  async getOrders(
    startDate: string,
    endDate: string,
    storeId?: string,
    channel?: string,
    status?: OrderStatus
  ): Promise<Order[]> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.lineItems', 'lineItems')
      .where('DATE(order.createdAt) >= :startDate', { startDate })
      .andWhere('DATE(order.createdAt) <= :endDate', { endDate });

    if (storeId) {
      queryBuilder.andWhere('order.storeId = :storeId', { storeId });
    }

    if (channel) {
      queryBuilder.andWhere('order.channel = :channel', { channel });
    }

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    const orders = await queryBuilder.getMany();
    return orders.map((order) => this.mapOrderEntityToOrder(order));
  }

  async recordSale(
    storeId: string,
    orderId: string,
    currency: string,
    channel: string,
    lineItems: RecordLineItemInput[],
    settledAt?: string
  ): Promise<Order> {
    const items: LineItemEntity[] = lineItems.map((li) => {
      const lineItem = new LineItemEntity();
      lineItem.orderStoreId = storeId;
      lineItem.orderOrderId = orderId;
      lineItem.sku = li.sku;
      lineItem.name = li.name;
      lineItem.unitPrice = li.unitPrice;
      lineItem.quantity = li.quantity;
      lineItem.subtotal = li.unitPrice * li.quantity;
      return lineItem;
    });

    const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);
    const now = new Date();
    const settled = settledAt ? new Date(settledAt) : now;

    const order = new OrderEntity();
    order.storeId = storeId;
    order.orderId = orderId;
    order.createdAt = now;
    order.settledAt = settled;
    order.totalAmount = totalAmount;
    order.currency = currency;
    order.status = OrderStatus.PAID;
    order.channel = channel;
    order.lineItems = items;

    const savedOrder = await this.orderRepository.save(order);
    return this.mapOrderEntityToOrder(savedOrder);
  }

  async recordSalesBatch(sales: RecordSaleInput[]): Promise<Order[]> {
    const orders: Order[] = [];

    for (const sale of sales) {
      const order = await this.recordSale(
        sale.storeId,
        sale.orderId,
        sale.currency,
        sale.channel,
        sale.lineItems,
        sale.settledAt
      );
      orders.push(order);
    }

    return orders;
  }

  async refundOrder(
    storeId: string,
    orderId: string,
    amount: number
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { storeId, orderId },
      relations: ['lineItems'],
    });

    if (!order) {
      throw new Error('주문을 찾을 수 없습니다.');
    }

    order.status = OrderStatus.REFUNDED;
    order.totalAmount = -Math.abs(amount);
    order.lineItems = [];

    const savedOrder = await this.orderRepository.save(order);
    return this.mapOrderEntityToOrder(savedOrder);
  }

  async getDailySales(
    date: string,
    storeId?: string
  ): Promise<DailySales> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.lineItems', 'lineItems')
      .where('DATE(order.createdAt) = :date', { date })
      .andWhere('order.status = :status', { status: OrderStatus.PAID });

    if (storeId) {
      queryBuilder.andWhere('order.storeId = :storeId', { storeId });
    }

    const orders = await queryBuilder.getMany();

    const totalSales = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    );
    const transactionCount = orders.length;
    const averageTransactionValue =
      transactionCount > 0 ? totalSales / transactionCount : 0;

    // 채널별 집계
    const channelMap = new Map<string, { totalSales: number; count: number }>();
    orders.forEach((order) => {
      const existing = channelMap.get(order.channel) || {
        totalSales: 0,
        count: 0,
      };
      existing.totalSales += Number(order.totalAmount);
      existing.count += 1;
      channelMap.set(order.channel, existing);
    });

    const channelBreakdown: ChannelSales[] = Array.from(
      channelMap.entries()
    ).map(([channel, data]) => ({
      channel,
      totalSales: Math.round(data.totalSales * 100) / 100,
      transactionCount: data.count,
    }));

    return {
      date,
      storeId,
      totalSales: Math.round(totalSales * 100) / 100,
      transactionCount,
      averageTransactionValue: Math.round(averageTransactionValue * 100) / 100,
      channelBreakdown,
    };
  }

  async getWeeklySales(
    weekStart: string,
    storeId?: string
  ): Promise<WeeklySales> {
    const weekEnd = this.getWeekEnd(weekStart);
    const weekDates = this.getWeekDates(weekStart);
    const previousWeekStart = this.getPreviousWeekStart(weekStart);

    // 주간 데이터 집계
    const dailySalesList: DailySales[] = await Promise.all(
      weekDates.map((date) => this.getDailySales(date, storeId))
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
    const previousWeekDailySales = await this.getDailySales(
      previousWeekStart,
      storeId
    );
    const previousWeekSales = previousWeekDailySales.totalSales;
    const growthRate =
      previousWeekSales > 0
        ? ((totalSales - previousWeekSales) / previousWeekSales) * 100
        : undefined;

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

  async getMonthlySales(
    year: number,
    month: number,
    storeId?: string
  ): Promise<MonthlySales> {
    const monthDates = this.getMonthDates(year, month);
    const previousMonth = this.getPreviousMonth(year, month);

    // 월간 데이터 집계
    const dailySalesList: DailySales[] = await Promise.all(
      monthDates.map((date) => this.getDailySales(date, storeId))
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
    const previousMonthDailySales = await this.getDailySales(
      previousMonthFirstDay,
      storeId
    );
    const previousMonthSales = previousMonthDailySales.totalSales;
    const growthRate =
      previousMonthSales > 0
        ? ((totalSales - previousMonthSales) / previousMonthSales) * 100
        : undefined;

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

  async getSalesDashboard(
    startDate: string,
    endDate: string,
    storeId?: string
  ): Promise<SalesDashboard> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.lineItems', 'lineItems')
      .where('DATE(order.createdAt) >= :startDate', { startDate })
      .andWhere('DATE(order.createdAt) <= :endDate', { endDate })
      .andWhere('order.status = :status', { status: OrderStatus.PAID });

    if (storeId) {
      queryBuilder.andWhere('order.storeId = :storeId', { storeId });
    }

    const orders = await queryBuilder.getMany();

    const totalSales = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    );
    const totalTransactions = orders.length;
    const averageTransactionValue =
      totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // 지점별 집계
    const storeMap = new Map<string, { totalSales: number; count: number }>();
    orders.forEach((order) => {
      const existing = storeMap.get(order.storeId) || {
        totalSales: 0,
        count: 0,
      };
      existing.totalSales += Number(order.totalAmount);
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
    orders.forEach((order) => {
      const existing = channelMap.get(order.channel) || {
        totalSales: 0,
        count: 0,
      };
      existing.totalSales += Number(order.totalAmount);
      existing.count += 1;
      channelMap.set(order.channel, existing);
    });

    const channelDistribution: ChannelSales[] = Array.from(
      channelMap.entries()
    ).map(([channel, data]) => ({
      channel,
      totalSales: Math.round(data.totalSales * 100) / 100,
      transactionCount: data.count,
    }));

    // 기간별 트렌드 (일별)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const trendDates: string[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      trendDates.push(d.toISOString().split('T')[0]);
    }

    const trend: DailySales[] = await Promise.all(
      trendDates.map((date) => this.getDailySales(date, storeId))
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

  // 유틸리티 함수들
  private getWeekStart(date: string): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
  }

  private getWeekEnd(weekStart: string): string {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    return d.toISOString().split('T')[0];
  }

  private getWeekDates(weekStart: string): string[] {
    const dates: string[] = [];
    const start = new Date(weekStart);
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }

  private getMonthDates(year: number, month: number): string[] {
    const dates: string[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(
        day
      ).padStart(2, '0')}`;
      dates.push(dateStr);
    }
    return dates;
  }

  private getPreviousWeekStart(weekStart: string): string {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  }

  private getPreviousMonth(
    year: number,
    month: number
  ): { year: number; month: number } {
    if (month === 1) {
      return { year: year - 1, month: 12 };
    }
    return { year, month: month - 1 };
  }

  private mapOrderEntityToOrder(order: OrderEntity): Order {
    return {
      storeId: order.storeId,
      orderId: order.orderId,
      createdAt: order.createdAt.toISOString(),
      settledAt: order.settledAt?.toISOString(),
      totalAmount: Number(order.totalAmount),
      currency: order.currency,
      status: order.status,
      channel: order.channel,
      lineItems: order.lineItems.map((li) => ({
        sku: li.sku,
        name: li.name,
        unitPrice: Number(li.unitPrice),
        quantity: Number(li.quantity),
        subtotal: Number(li.subtotal),
      })),
    };
  }
}

