import { Query, Resolver, Args, Mutation, ID } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PurchaseOrder,
  PurchaseOrderStatus,
} from '../models/purchase-order.model';
import { CreatePurchaseOrderInput } from '../models/inputs.model';
import { PurchaseOrderEntity } from '../entities/purchase-order.entity';
import { InventoryItemEntity } from '../entities/inventory-item.entity';
import { InventoryAuditEntity } from '../entities/inventory-audit.entity';

@Resolver(() => PurchaseOrder)
export class PurchaseOrderResolver {
  constructor(
    @InjectRepository(PurchaseOrderEntity)
    private purchaseOrderRepository: Repository<PurchaseOrderEntity>,
    @InjectRepository(InventoryItemEntity)
    private inventoryItemRepository: Repository<InventoryItemEntity>,
    @InjectRepository(InventoryAuditEntity)
    private inventoryAuditRepository: Repository<InventoryAuditEntity>
  ) {}

  @Query(() => PurchaseOrder, { nullable: true, description: '발주 조회' })
  async purchaseOrder(
    @Args('id', { type: () => ID }) id: string
  ): Promise<PurchaseOrder | null> {
    const entity = await this.purchaseOrderRepository.findOne({
      where: { id },
    });
    if (!entity) return null;
    return this.mapEntityToModel(entity);
  }

  @Query(() => [PurchaseOrder], { description: '발주 목록 조회' })
  async purchaseOrders(
    @Args('storeId', { type: () => ID, nullable: true }) storeId?: string,
    @Args('sku', { type: () => ID, nullable: true }) sku?: string,
    @Args('status', { type: () => PurchaseOrderStatus, nullable: true })
    status?: PurchaseOrderStatus
  ): Promise<PurchaseOrder[]> {
    const queryBuilder =
      this.purchaseOrderRepository.createQueryBuilder('purchaseOrder');

    if (storeId) {
      queryBuilder.andWhere('purchaseOrder.storeId = :storeId', { storeId });
    }

    if (sku) {
      queryBuilder.andWhere('purchaseOrder.sku = :sku', { sku });
    }

    if (status) {
      queryBuilder.andWhere('purchaseOrder.status = :status', { status });
    }

    const entities = await queryBuilder.getMany();
    return entities.map((entity) => this.mapEntityToModel(entity));
  }

  @Mutation(() => PurchaseOrder, { description: '발주 요청 생성' })
  async createPurchaseOrder(
    @Args('input') input: CreatePurchaseOrderInput
  ): Promise<PurchaseOrder> {
    const entity = this.purchaseOrderRepository.create({
      storeId: input.storeId,
      sku: input.sku,
      requestedQuantity: input.requestedQuantity,
      approvedQuantity: undefined,
      receivedQuantity: undefined,
      status: PurchaseOrderStatus.PENDING,
      requestedBy: 'USER-001', // 실제로는 컨텍스트에서 가져옴
      approvedBy: undefined,
      requestedAt: new Date(),
      approvedAt: undefined,
      receivedAt: undefined,
      notes: input.notes,
    });

    const saved = await this.purchaseOrderRepository.save(entity);
    return this.mapEntityToModel(saved);
  }

  @Mutation(() => PurchaseOrder, { description: '발주 승인' })
  async approvePurchaseOrder(
    @Args('id', { type: () => ID }) id: string,
    @Args('approvedQuantity') approvedQuantity: number,
    @Args('notes', { nullable: true }) notes?: string
  ): Promise<PurchaseOrder> {
    const entity = await this.purchaseOrderRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error(`발주를 찾을 수 없습니다: ${id}`);
    }

    if (entity.status !== PurchaseOrderStatus.PENDING) {
      throw new Error('승인 대기 상태의 발주만 승인할 수 있습니다.');
    }

    entity.status = PurchaseOrderStatus.APPROVED;
    entity.approvedQuantity = approvedQuantity;
    entity.approvedBy = 'MANAGER-001'; // 실제로는 컨텍스트에서 가져옴
    entity.approvedAt = new Date();
    if (notes) {
      entity.notes = notes;
    }

    const updated = await this.purchaseOrderRepository.save(entity);
    return this.mapEntityToModel(updated);
  }

  @Mutation(() => PurchaseOrder, { description: '발주 거부' })
  async rejectPurchaseOrder(
    @Args('id', { type: () => ID }) id: string,
    @Args('notes') notes: string
  ): Promise<PurchaseOrder> {
    const entity = await this.purchaseOrderRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error(`발주를 찾을 수 없습니다: ${id}`);
    }

    if (entity.status !== PurchaseOrderStatus.PENDING) {
      throw new Error('승인 대기 상태의 발주만 거부할 수 있습니다.');
    }

    entity.status = PurchaseOrderStatus.REJECTED;
    entity.approvedBy = 'MANAGER-001'; // 실제로는 컨텍스트에서 가져옴
    entity.approvedAt = new Date();
    entity.notes = notes;

    const updated = await this.purchaseOrderRepository.save(entity);
    return this.mapEntityToModel(updated);
  }

  @Mutation(() => PurchaseOrder, { description: '입고 처리' })
  async receiveInventory(
    @Args('purchaseOrderId', { type: () => ID }) purchaseOrderId: string,
    @Args('receivedQuantity') receivedQuantity: number,
    @Args('notes', { nullable: true }) notes?: string
  ): Promise<PurchaseOrder> {
    const entity = await this.purchaseOrderRepository.findOne({
      where: { id: purchaseOrderId },
    });

    if (!entity) {
      throw new Error(`발주를 찾을 수 없습니다: ${purchaseOrderId}`);
    }

    if (entity.status !== PurchaseOrderStatus.APPROVED) {
      throw new Error('승인된 발주만 입고 처리할 수 있습니다.');
    }

    const now = new Date();

    entity.status = PurchaseOrderStatus.RECEIVED;
    entity.receivedQuantity = receivedQuantity;
    entity.receivedAt = now;
    if (notes) {
      entity.notes = notes;
    }

    const updated = await this.purchaseOrderRepository.save(entity);

    // 입고 시 재고 자동 업데이트
    const existingInventory = await this.inventoryItemRepository.findOne({
      where: { storeId: entity.storeId, sku: entity.sku },
    });

    if (existingInventory) {
      // 기존 재고에 입고 수량 추가
      const previousQuantity = Number(existingInventory.quantityOnHand);
      existingInventory.quantityOnHand =
        previousQuantity + receivedQuantity;
      existingInventory.updatedAt = now;
      await this.inventoryItemRepository.save(existingInventory);

      // 재고 실사 이력 기록
      const auditEntity = this.inventoryAuditRepository.create({
        storeId: entity.storeId,
        sku: entity.sku,
        previousQuantity,
        newQuantity: previousQuantity + receivedQuantity,
        auditDate: now,
        performedBy: 'SYSTEM', // 입고 처리로 인한 자동 업데이트
        notes: `입고 처리: 발주 ${purchaseOrderId} (${receivedQuantity}개)`,
      });
      await this.inventoryAuditRepository.save(auditEntity);
    } else {
      // 재고 항목이 없으면 새로 생성
      const newInventory = this.inventoryItemRepository.create({
        storeId: entity.storeId,
        sku: entity.sku,
        quantityOnHand: receivedQuantity,
        reserved: 0,
        reorderPoint: 0,
        lastAuditAt: now,
      });
      await this.inventoryItemRepository.save(newInventory);

      // 재고 실사 이력 기록
      const auditEntity = this.inventoryAuditRepository.create({
        storeId: entity.storeId,
        sku: entity.sku,
        previousQuantity: 0,
        newQuantity: receivedQuantity,
        auditDate: now,
        performedBy: 'SYSTEM',
        notes: `입고 처리: 발주 ${purchaseOrderId} (${receivedQuantity}개)`,
      });
      await this.inventoryAuditRepository.save(auditEntity);
    }

    return this.mapEntityToModel(updated);
  }

  // 엔티티를 GraphQL 모델로 변환
  private mapEntityToModel(entity: PurchaseOrderEntity): PurchaseOrder {
    return {
      id: entity.id,
      storeId: entity.storeId,
      sku: entity.sku,
      requestedQuantity: Number(entity.requestedQuantity),
      approvedQuantity: entity.approvedQuantity
        ? Number(entity.approvedQuantity)
        : undefined,
      receivedQuantity: entity.receivedQuantity
        ? Number(entity.receivedQuantity)
        : undefined,
      status: entity.status,
      requestedBy: entity.requestedBy,
      approvedBy: entity.approvedBy,
      requestedAt: entity.requestedAt.toISOString(),
      approvedAt: entity.approvedAt?.toISOString(),
      receivedAt: entity.receivedAt?.toISOString(),
      notes: entity.notes,
    };
  }
}
