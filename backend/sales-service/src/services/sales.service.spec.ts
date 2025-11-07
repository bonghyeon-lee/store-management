import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesService } from './sales.service';
import { OrderEntity } from '../entities/order.entity';
import { LineItemEntity } from '../entities/line-item.entity';
import { OrderStatus, RecordLineItemInput } from '../models/sales.model';

describe('SalesService', () => {
  let service: SalesService;
  let orderRepository: jest.Mocked<Repository<OrderEntity>>;
  let lineItemRepository: jest.Mocked<Repository<LineItemEntity>>;

  const mockOrderRepository = {
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    save: jest.fn(),
  };

  const mockLineItemRepository = {
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: getRepositoryToken(OrderEntity),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(LineItemEntity),
          useValue: mockLineItemRepository,
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
    orderRepository = module.get(getRepositoryToken(OrderEntity));
    lineItemRepository = module.get(getRepositoryToken(LineItemEntity));

    jest.clearAllMocks();
  });

  describe('getOrder', () => {
    it('should return an order when found', async () => {
      const storeId = 'STORE-001';
      const orderId = 'ORDER-001';
      const mockOrder = createMockOrderEntity(storeId, orderId);

      mockOrderRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.getOrder(storeId, orderId);

      expect(result).toBeDefined();
      expect(result?.storeId).toBe(storeId);
      expect(result?.orderId).toBe(orderId);
      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { storeId, orderId },
        relations: ['lineItems'],
      });
    });

    it('should return null when order not found', async () => {
      const storeId = 'STORE-001';
      const orderId = 'ORDER-999';

      mockOrderRepository.findOne.mockResolvedValue(null);

      const result = await service.getOrder(storeId, orderId);

      expect(result).toBeNull();
    });
  });

  describe('getOrders', () => {
    it('should return filtered orders by date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const mockOrders = [
        createMockOrderEntity('STORE-001', 'ORDER-001'),
        createMockOrderEntity('STORE-001', 'ORDER-002'),
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockOrders),
      };

      mockOrderRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any
      );

      const result = await service.getOrders(startDate, endDate);

      expect(result).toHaveLength(2);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'DATE(order.createdAt) >= :startDate',
        { startDate }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'DATE(order.createdAt) <= :endDate',
        { endDate }
      );
    });

    it('should filter by storeId when provided', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const storeId = 'STORE-001';
      const mockOrders = [createMockOrderEntity(storeId, 'ORDER-001')];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockOrders),
      };

      mockOrderRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any
      );

      await service.getOrders(startDate, endDate, storeId);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'order.storeId = :storeId',
        { storeId }
      );
    });

    it('should filter by channel when provided', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const channel = 'POS';

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockOrderRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any
      );

      await service.getOrders(startDate, endDate, undefined, channel);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'order.channel = :channel',
        { channel }
      );
    });

    it('should filter by status when provided', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const status = OrderStatus.PAID;

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockOrderRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any
      );

      await service.getOrders(startDate, endDate, undefined, undefined, status);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'order.status = :status',
        { status }
      );
    });
  });

  describe('recordSale', () => {
    it('should create a new order with line items', async () => {
      const storeId = 'STORE-001';
      const orderId = 'ORDER-001';
      const currency = 'KRW';
      const channel = 'POS';
      const lineItems: RecordLineItemInput[] = [
        {
          sku: 'SKU-001',
          name: '상품 1',
          unitPrice: 10000,
          quantity: 2,
        },
        {
          sku: 'SKU-002',
          name: '상품 2',
          unitPrice: 5000,
          quantity: 1,
        },
      ];

      const mockOrder = createMockOrderEntity(storeId, orderId);
      mockOrder.totalAmount = 25000; // (10000 * 2) + (5000 * 1)
      mockOrderRepository.save.mockResolvedValue(mockOrder);

      const result = await service.recordSale(
        storeId,
        orderId,
        currency,
        channel,
        lineItems
      );

      expect(result).toBeDefined();
      expect(result.storeId).toBe(storeId);
      expect(result.orderId).toBe(orderId);
      expect(result.totalAmount).toBe(25000); // (10000 * 2) + (5000 * 1)
      expect(result.status).toBe(OrderStatus.PAID);
      expect(mockOrderRepository.save).toHaveBeenCalled();
    });

    it('should calculate total amount correctly', async () => {
      const storeId = 'STORE-001';
      const orderId = 'ORDER-002';
      const lineItems: RecordLineItemInput[] = [
        {
          sku: 'SKU-001',
          name: '상품 1',
          unitPrice: 15000,
          quantity: 3,
        },
      ];

      const mockOrder = createMockOrderEntity(storeId, orderId);
      mockOrder.totalAmount = 45000;
      mockOrderRepository.save.mockResolvedValue(mockOrder);

      const result = await service.recordSale(
        storeId,
        orderId,
        'KRW',
        'ONLINE',
        lineItems
      );

      expect(result.totalAmount).toBe(45000);
    });

    it('should use settledAt when provided', async () => {
      const storeId = 'STORE-001';
      const orderId = 'ORDER-003';
      const settledAt = '2024-01-01T12:00:00Z';
      const lineItems: RecordLineItemInput[] = [
        {
          sku: 'SKU-001',
          name: '상품 1',
          unitPrice: 10000,
          quantity: 1,
        },
      ];

      const mockOrder = createMockOrderEntity(storeId, orderId);
      mockOrder.settledAt = new Date(settledAt);
      mockOrderRepository.save.mockResolvedValue(mockOrder);

      const result = await service.recordSale(
        storeId,
        orderId,
        'KRW',
        'POS',
        lineItems,
        settledAt
      );

      // toISOString() includes milliseconds, so we check the date part
      expect(result.settledAt).toContain('2024-01-01T12:00:00');
    });
  });

  describe('recordSalesBatch', () => {
    it('should create multiple orders', async () => {
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
        {
          storeId: 'STORE-001',
          orderId: 'ORDER-002',
          currency: 'KRW',
          channel: 'ONLINE',
          lineItems: [
            {
              sku: 'SKU-002',
              name: '상품 2',
              unitPrice: 5000,
              quantity: 2,
            },
          ],
        },
      ];

      const mockOrders = sales.map((sale) =>
        createMockOrderEntity(sale.storeId, sale.orderId)
      );
      mockOrderRepository.save
        .mockResolvedValueOnce(mockOrders[0])
        .mockResolvedValueOnce(mockOrders[1]);

      const result = await service.recordSalesBatch(sales);

      expect(result).toHaveLength(2);
      expect(mockOrderRepository.save).toHaveBeenCalledTimes(2);
    });
  });

  describe('refundOrder', () => {
    it('should refund an existing order', async () => {
      const storeId = 'STORE-001';
      const orderId = 'ORDER-001';
      const refundAmount = 10000;

      const mockOrder = createMockOrderEntity(storeId, orderId);
      mockOrder.status = OrderStatus.PAID;
      mockOrder.totalAmount = 25000;

      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.REFUNDED,
        totalAmount: -refundAmount,
      });

      const result = await service.refundOrder(storeId, orderId, refundAmount);

      expect(result.status).toBe(OrderStatus.REFUNDED);
      expect(result.totalAmount).toBe(-refundAmount);
      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: { storeId, orderId },
        relations: ['lineItems'],
      });
    });

    it('should throw error when order not found', async () => {
      const storeId = 'STORE-001';
      const orderId = 'ORDER-999';

      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(
        service.refundOrder(storeId, orderId, 10000)
      ).rejects.toThrow('주문을 찾을 수 없습니다.');
    });
  });

  describe('getDailySales', () => {
    it('should calculate daily sales correctly', async () => {
      const date = '2024-01-01';
      const mockOrders = [
        {
          ...createMockOrderEntity('STORE-001', 'ORDER-001'),
          totalAmount: 10000,
          channel: 'POS',
          status: OrderStatus.PAID,
        },
        {
          ...createMockOrderEntity('STORE-001', 'ORDER-002'),
          totalAmount: 20000,
          channel: 'ONLINE',
          status: OrderStatus.PAID,
        },
        {
          ...createMockOrderEntity('STORE-001', 'ORDER-003'),
          totalAmount: 15000,
          channel: 'POS',
          status: OrderStatus.PAID,
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockOrders),
      };

      mockOrderRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any
      );

      const result = await service.getDailySales(date);

      expect(result.date).toBe(date);
      expect(result.totalSales).toBe(45000);
      expect(result.transactionCount).toBe(3);
      expect(result.averageTransactionValue).toBe(15000);
      expect(result.channelBreakdown).toHaveLength(2);
      expect(result.channelBreakdown[0].channel).toBe('POS');
      expect(result.channelBreakdown[0].totalSales).toBe(25000);
      expect(result.channelBreakdown[1].channel).toBe('ONLINE');
      expect(result.channelBreakdown[1].totalSales).toBe(20000);
    });

    it('should return zero values when no orders', async () => {
      const date = '2024-01-01';

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockOrderRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any
      );

      const result = await service.getDailySales(date);

      expect(result.totalSales).toBe(0);
      expect(result.transactionCount).toBe(0);
      expect(result.averageTransactionValue).toBe(0);
    });
  });

  describe('getWeeklySales', () => {
    it('should calculate weekly sales with growth rate', async () => {
      const weekStart = '2024-01-01';

      // Mock daily sales for the week (7 days)
      const mockDailySales = [
        { date: '2024-01-01', totalSales: 10000, transactionCount: 1 },
        { date: '2024-01-02', totalSales: 20000, transactionCount: 2 },
        { date: '2024-01-03', totalSales: 0, transactionCount: 0 },
        { date: '2024-01-04', totalSales: 0, transactionCount: 0 },
        { date: '2024-01-05', totalSales: 0, transactionCount: 0 },
        { date: '2024-01-06', totalSales: 0, transactionCount: 0 },
        { date: '2024-01-07', totalSales: 0, transactionCount: 0 },
      ] as any;

      // Mock previous week sales
      const mockPreviousWeekDailySales = {
        date: '2023-12-25',
        totalSales: 5000,
        transactionCount: 1,
      } as any;

      jest
        .spyOn(service, 'getDailySales')
        .mockResolvedValueOnce(mockDailySales[0])
        .mockResolvedValueOnce(mockDailySales[1])
        .mockResolvedValueOnce(mockDailySales[2])
        .mockResolvedValueOnce(mockDailySales[3])
        .mockResolvedValueOnce(mockDailySales[4])
        .mockResolvedValueOnce(mockDailySales[5])
        .mockResolvedValueOnce(mockDailySales[6])
        .mockResolvedValueOnce(mockPreviousWeekDailySales);

      const result = await service.getWeeklySales(weekStart);

      expect(result.weekStart).toBe(weekStart);
      expect(result.totalSales).toBe(30000);
      expect(result.transactionCount).toBe(3);
      expect(result.dailySales).toHaveLength(7);
    });
  });

  describe('getMonthlySales', () => {
    it('should calculate monthly sales with growth rate', async () => {
      const year = 2024;
      const month = 1;

      // Mock daily sales for the month
      const mockDailySales = {
        date: '2024-01-01',
        totalSales: 10000,
        transactionCount: 1,
      } as any;

      jest
        .spyOn(service, 'getDailySales')
        .mockResolvedValue(mockDailySales);

      const result = await service.getMonthlySales(year, month);

      expect(result.year).toBe(year);
      expect(result.month).toBe(month);
      expect(result.dailySales.length).toBeGreaterThan(0);
    });
  });

  describe('getSalesDashboard', () => {
    it('should return dashboard data with store summary', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const mockOrders = [
        {
          ...createMockOrderEntity('STORE-001', 'ORDER-001'),
          totalAmount: 10000,
          channel: 'POS',
          status: OrderStatus.PAID,
        },
        {
          ...createMockOrderEntity('STORE-002', 'ORDER-002'),
          totalAmount: 20000,
          channel: 'ONLINE',
          status: OrderStatus.PAID,
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockOrders),
      };

      mockOrderRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any
      );

      jest
        .spyOn(service, 'getDailySales')
        .mockResolvedValue({} as any);

      const result = await service.getSalesDashboard(startDate, endDate);

      expect(result.period).toBe(`${startDate} ~ ${endDate}`);
      expect(result.totalSales).toBe(30000);
      expect(result.totalTransactions).toBe(2);
      expect(result.storeSummary).toHaveLength(2);
      expect(result.topStores.length).toBeLessThanOrEqual(5);
      expect(result.bottomStores.length).toBeLessThanOrEqual(5);
      expect(result.channelDistribution).toHaveLength(2);
    });
  });

  // Helper function to create mock OrderEntity
  function createMockOrderEntity(
    storeId: string,
    orderId: string
  ): OrderEntity {
    const order = new OrderEntity();
    order.storeId = storeId;
    order.orderId = orderId;
    order.createdAt = new Date('2024-01-01T10:00:00Z');
    order.settledAt = new Date('2024-01-01T10:00:00Z');
    order.totalAmount = 10000;
    order.currency = 'KRW';
    order.status = OrderStatus.PAID;
    order.channel = 'POS';
    order.lineItems = [];

    return order;
  }
});

