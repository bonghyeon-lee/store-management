import { Test, TestingModule } from '@nestjs/testing';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { SalesResolver } from './sales.resolver';
import { SalesService } from '../services/sales.service';
import { OrderStatus } from '../models/sales.model';

describe('SalesResolver', () => {
  let resolver: SalesResolver;
  let salesService: jest.Mocked<SalesService>;

  const mockSalesService = {
    getOrder: jest.fn(),
    getOrders: jest.fn(),
    recordSale: jest.fn(),
    recordSalesBatch: jest.fn(),
    refundOrder: jest.fn(),
    getDailySales: jest.fn(),
    getWeeklySales: jest.fn(),
    getMonthlySales: jest.fn(),
    getSalesDashboard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloFederationDriverConfig>({
          driver: ApolloFederationDriver,
          autoSchemaFile: true,
          sortSchema: true,
        }),
      ],
      providers: [
        SalesResolver,
        {
          provide: SalesService,
          useValue: mockSalesService,
        },
      ],
    }).compile();

    resolver = module.get<SalesResolver>(SalesResolver);
    salesService = module.get(SalesService);

    jest.clearAllMocks();
  });

  describe('order', () => {
    it('should return an order', async () => {
      const storeId = 'STORE-001';
      const orderId = 'ORDER-001';
      const mockOrder = {
        storeId,
        orderId,
        createdAt: '2024-01-01T10:00:00Z',
        settledAt: '2024-01-01T10:00:00Z',
        totalAmount: 10000,
        currency: 'KRW',
        status: OrderStatus.PAID,
        channel: 'POS',
        lineItems: [],
      };

      salesService.getOrder.mockResolvedValue(mockOrder);

      const result = await resolver.order(storeId, orderId);

      expect(result).toEqual(mockOrder);
      expect(salesService.getOrder).toHaveBeenCalledWith(storeId, orderId);
    });

    it('should return null when order not found', async () => {
      const storeId = 'STORE-001';
      const orderId = 'ORDER-999';

      salesService.getOrder.mockResolvedValue(null);

      const result = await resolver.order(storeId, orderId);

      expect(result).toBeNull();
    });
  });

  describe('orders', () => {
    it('should return filtered orders', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const storeId = 'STORE-001';
      const channel = 'POS';
      const status = OrderStatus.PAID;

      const mockOrders = [
        {
          storeId: 'STORE-001',
          orderId: 'ORDER-001',
          createdAt: '2024-01-01T10:00:00Z',
          totalAmount: 10000,
          currency: 'KRW',
          status: OrderStatus.PAID,
          channel: 'POS',
          lineItems: [],
        },
      ];

      salesService.getOrders.mockResolvedValue(mockOrders);

      const result = await resolver.orders(
        startDate,
        endDate,
        storeId,
        channel,
        status
      );

      expect(result).toEqual(mockOrders);
      expect(salesService.getOrders).toHaveBeenCalledWith(
        startDate,
        endDate,
        storeId,
        channel,
        status
      );
    });
  });

  describe('recordSale', () => {
    it('should record a sale', async () => {
      const storeId = 'STORE-001';
      const orderId = 'ORDER-001';
      const currency = 'KRW';
      const channel = 'POS';
      const lineItems = [
        {
          sku: 'SKU-001',
          name: '상품 1',
          unitPrice: 10000,
          quantity: 1,
        },
      ];
      const settledAt = '2024-01-01T10:00:00Z';

      const mockOrder = {
        storeId,
        orderId,
        createdAt: '2024-01-01T10:00:00Z',
        settledAt,
        totalAmount: 10000,
        currency,
        status: OrderStatus.PAID,
        channel,
        lineItems: [],
      };

      salesService.recordSale.mockResolvedValue(mockOrder);

      const result = await resolver.recordSale(
        storeId,
        orderId,
        currency,
        channel,
        lineItems,
        settledAt
      );

      expect(result).toEqual(mockOrder);
      expect(salesService.recordSale).toHaveBeenCalledWith(
        storeId,
        orderId,
        currency,
        channel,
        lineItems,
        settledAt
      );
    });
  });

  describe('recordSalesBatch', () => {
    it('should record multiple sales', async () => {
      const sales = [
        {
          storeId: 'STORE-001',
          orderId: 'ORDER-001',
          currency: 'KRW',
          channel: 'POS',
          lineItems: [
            {
              sku: 'SKU-001',
              name: '상품 1',
              unitPrice: 10000,
              quantity: 1,
            },
          ],
        },
      ];

      const mockOrders = [
        {
          storeId: 'STORE-001',
          orderId: 'ORDER-001',
          createdAt: '2024-01-01T10:00:00Z',
          totalAmount: 10000,
          currency: 'KRW',
          status: OrderStatus.PAID,
          channel: 'POS',
          lineItems: [],
        },
      ];

      salesService.recordSalesBatch.mockResolvedValue(mockOrders);

      const result = await resolver.recordSalesBatch(sales);

      expect(result).toEqual(mockOrders);
      expect(salesService.recordSalesBatch).toHaveBeenCalledWith(sales);
    });
  });

  describe('refundOrder', () => {
    it('should refund an order', async () => {
      const storeId = 'STORE-001';
      const orderId = 'ORDER-001';
      const amount = 10000;

      const mockOrder = {
        storeId,
        orderId,
        createdAt: '2024-01-01T10:00:00Z',
        totalAmount: -amount,
        currency: 'KRW',
        status: OrderStatus.REFUNDED,
        channel: 'POS',
        lineItems: [],
      };

      salesService.refundOrder.mockResolvedValue(mockOrder);

      const result = await resolver.refundOrder(storeId, orderId, amount);

      expect(result).toEqual(mockOrder);
      expect(salesService.refundOrder).toHaveBeenCalledWith(
        storeId,
        orderId,
        amount
      );
    });
  });

  describe('dailySales', () => {
    it('should return daily sales', async () => {
      const date = '2024-01-01';
      const storeId = 'STORE-001';

      const mockDailySales = {
        date,
        storeId,
        totalSales: 10000,
        transactionCount: 1,
        averageTransactionValue: 10000,
        channelBreakdown: [],
      };

      salesService.getDailySales.mockResolvedValue(mockDailySales);

      const result = await resolver.dailySales(date, storeId);

      expect(result).toEqual(mockDailySales);
      expect(salesService.getDailySales).toHaveBeenCalledWith(date, storeId);
    });
  });

  describe('weeklySales', () => {
    it('should return weekly sales', async () => {
      const weekStart = '2024-01-01';
      const storeId = 'STORE-001';

      const mockWeeklySales = {
        weekStart,
        weekEnd: '2024-01-07',
        storeId,
        totalSales: 70000,
        transactionCount: 7,
        averageTransactionValue: 10000,
        dailySales: [],
      };

      salesService.getWeeklySales.mockResolvedValue(mockWeeklySales);

      const result = await resolver.weeklySales(weekStart, storeId);

      expect(result).toEqual(mockWeeklySales);
      expect(salesService.getWeeklySales).toHaveBeenCalledWith(
        weekStart,
        storeId
      );
    });
  });

  describe('monthlySales', () => {
    it('should return monthly sales', async () => {
      const year = 2024;
      const month = 1;
      const storeId = 'STORE-001';

      const mockMonthlySales = {
        year,
        month,
        storeId,
        totalSales: 310000,
        transactionCount: 31,
        averageTransactionValue: 10000,
        dailySales: [],
      };

      salesService.getMonthlySales.mockResolvedValue(mockMonthlySales);

      const result = await resolver.monthlySales(year, month, storeId);

      expect(result).toEqual(mockMonthlySales);
      expect(salesService.getMonthlySales).toHaveBeenCalledWith(
        year,
        month,
        storeId
      );
    });
  });

  describe('salesDashboard', () => {
    it('should return sales dashboard', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const storeId = 'STORE-001';

      const mockDashboard = {
        period: `${startDate} ~ ${endDate}`,
        totalSales: 310000,
        totalTransactions: 31,
        averageTransactionValue: 10000,
        storeSummary: [],
        topStores: [],
        bottomStores: [],
        channelDistribution: [],
        trend: [],
      };

      salesService.getSalesDashboard.mockResolvedValue(mockDashboard);

      const result = await resolver.salesDashboard(
        startDate,
        endDate,
        storeId
      );

      expect(result).toEqual(mockDashboard);
      expect(salesService.getSalesDashboard).toHaveBeenCalledWith(
        startDate,
        endDate,
        storeId
      );
    });
  });
});

