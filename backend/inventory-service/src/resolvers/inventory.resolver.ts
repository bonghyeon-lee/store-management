import {
  Query,
  Resolver,
  Args,
  Mutation,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
// @ts-ignore - dataloader는 CommonJS 모듈이지만 esModuleInterop으로 처리됨
import DataLoader from 'dataloader';
import {
  InventoryItem,
  InventoryAudit,
  ReorderRecommendation,
} from '../models/inventory.model';
import {
  SubmitInventoryCountInput,
  SetReorderPointInput,
} from '../models/inputs.model';
import { Product } from '../models/product.model';
import { InventoryItemEntity } from '../entities/inventory-item.entity';
import { InventoryAuditEntity } from '../entities/inventory-audit.entity';
import { ProductEntity } from '../entities/product.entity';

@Resolver(() => InventoryItem)
export class InventoryResolver {
  private productLoader: DataLoader<string, Product | null>;

  constructor(
    @InjectRepository(InventoryItemEntity)
    private inventoryItemRepository: Repository<InventoryItemEntity>,
    @InjectRepository(InventoryAuditEntity)
    private inventoryAuditRepository: Repository<InventoryAuditEntity>,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>
  ) {
    // Product DataLoader 초기화
    this.productLoader = new DataLoader<string, Product | null>(
      async (productIds: readonly string[]) => {
        const products = await this.productRepository.find({
          where: { id: In([...productIds]) },
        });
        const productMap = new Map(
          products.map((p) => [p.id, this.mapProductEntityToModel(p)])
        );
        return productIds.map((id) => productMap.get(id) || null);
      }
    );
  }

  // Product 조회를 위한 ResolveField (Federation 확장)
  @ResolveField(() => Product, { nullable: true })
  async product(
    @Parent() inventoryItem: InventoryItem
  ): Promise<Product | null> {
    if (!inventoryItem.sku) {
      return null;
    }
    return this.productLoader.load(inventoryItem.sku);
  }

  @Query(() => InventoryItem, { nullable: true, description: '재고 항목 조회' })
  async inventoryItem(
    @Args('storeId', { type: () => ID }) storeId: string,
    @Args('sku', { type: () => ID }) sku: string
  ): Promise<InventoryItem | null> {
    const entity = await this.inventoryItemRepository.findOne({
      where: { storeId, sku },
    });
    if (!entity) return null;
    return this.mapInventoryItemEntityToModel(entity);
  }

  @Query(() => [InventoryItem], { description: '지점별 재고 목록 조회' })
  async storeInventories(
    @Args('storeId', { type: () => ID }) storeId: string,
    @Args('sku', { type: () => ID, nullable: true }) sku?: string
  ): Promise<InventoryItem[]> {
    const queryBuilder =
      this.inventoryItemRepository.createQueryBuilder('inventory');

    queryBuilder.where('inventory.storeId = :storeId', { storeId });

    if (sku) {
      queryBuilder.andWhere('inventory.sku = :sku', { sku });
    }

    const entities = await queryBuilder.getMany();
    return entities.map((entity) => this.mapInventoryItemEntityToModel(entity));
  }

  @Query(() => [InventoryItem], { description: 'SKU별 재고 조회 (모든 지점)' })
  async skuInventories(
    @Args('sku', { type: () => ID }) sku: string
  ): Promise<InventoryItem[]> {
    const entities = await this.inventoryItemRepository.find({
      where: { sku },
    });
    return entities.map((entity) => this.mapInventoryItemEntityToModel(entity));
  }

  @Query(() => [InventoryAudit], { description: '재고 실사 이력 조회' })
  async inventoryAuditHistory(
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
    @Args('storeId', { type: () => ID, nullable: true }) storeId?: string,
    @Args('sku', { type: () => ID, nullable: true }) sku?: string
  ): Promise<InventoryAudit[]> {
    const queryBuilder =
      this.inventoryAuditRepository.createQueryBuilder('audit');

    queryBuilder
      .where('audit.auditDate >= :startDate', { startDate })
      .andWhere('audit.auditDate <= :endDate', { endDate });

    if (storeId) {
      queryBuilder.andWhere('audit.storeId = :storeId', { storeId });
    }

    if (sku) {
      queryBuilder.andWhere('audit.sku = :sku', { sku });
    }

    const entities = await queryBuilder.getMany();
    return entities.map((entity) => this.mapInventoryAuditEntityToModel(entity));
  }

  @Query(() => [ReorderRecommendation], {
    description: '리오더 추천 목록 조회',
  })
  async reorderRecommendations(
    @Args('storeId', { type: () => ID, nullable: true }) storeId?: string,
    @Args('sku', { type: () => ID, nullable: true }) sku?: string
  ): Promise<ReorderRecommendation[]> {
    const queryBuilder =
      this.inventoryItemRepository.createQueryBuilder('inventory');

    queryBuilder.where(
      'inventory.quantityOnHand <= inventory.reorderPoint'
    );

    if (storeId) {
      queryBuilder.andWhere('inventory.storeId = :storeId', { storeId });
    }

    if (sku) {
      queryBuilder.andWhere('inventory.sku = :sku', { sku });
    }

    const entities = await queryBuilder.getMany();

    // 리오더 추천 생성
    const recommendations: ReorderRecommendation[] = await Promise.all(
      entities.map(async (entity) => {
        const quantityOnHand = Number(entity.quantityOnHand);
        const reorderPoint = Number(entity.reorderPoint);
        const shortage = reorderPoint - quantityOnHand;
        const recommendedQuantity = Math.max(
          reorderPoint * 2 - quantityOnHand,
          shortage
        );

        // 우선순위 계산 (재고 부족 정도 기준)
        const shortageRatio = shortage / reorderPoint;
        let priority = 1;
        let urgency = 'LOW';

        if (shortageRatio >= 0.8) {
          priority = 1;
          urgency = 'HIGH';
        } else if (shortageRatio >= 0.5) {
          priority = 2;
          urgency = 'MEDIUM';
        } else {
          priority = 3;
          urgency = 'LOW';
        }

        // 실제 Product 이름 가져오기
        const product = await this.productRepository.findOne({
          where: { id: entity.sku },
        });
        const productName = product?.name || `상품-${entity.sku}`;

        return {
          storeId: entity.storeId,
          sku: entity.sku,
          productName,
          currentQuantity: quantityOnHand,
          reorderPoint,
          recommendedQuantity,
          priority,
          urgency,
        };
      })
    );

    // 우선순위로 정렬
    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  @Mutation(() => InventoryItem, { description: '재고 실사 입력' })
  async submitInventoryCount(
    @Args('input') input: SubmitInventoryCountInput
  ): Promise<InventoryItem> {
    const existing = await this.inventoryItemRepository.findOne({
      where: { storeId: input.storeId, sku: input.sku },
    });

    const previousQuantity = existing
      ? Number(existing.quantityOnHand)
      : 0;
    const now = new Date();

    // 재고 실사 이력 기록
    const auditEntity = this.inventoryAuditRepository.create({
      storeId: input.storeId,
      sku: input.sku,
      previousQuantity,
      newQuantity: input.quantity,
      auditDate: now,
      performedBy: 'USER-001', // 실제로는 컨텍스트에서 가져옴
      notes: input.notes,
    });
    await this.inventoryAuditRepository.save(auditEntity);

    // 재고 업데이트 또는 생성
    if (existing) {
      existing.quantityOnHand = input.quantity;
      existing.lastAuditAt = now;
      const updated = await this.inventoryItemRepository.save(existing);
      return this.mapInventoryItemEntityToModel(updated);
    } else {
      const newEntity = this.inventoryItemRepository.create({
        storeId: input.storeId,
        sku: input.sku,
        quantityOnHand: input.quantity,
        reserved: 0,
        reorderPoint: 0,
        lastAuditAt: now,
      });
      const saved = await this.inventoryItemRepository.save(newEntity);
      return this.mapInventoryItemEntityToModel(saved);
    }
  }

  @Mutation(() => InventoryItem, { description: '안전재고 임계치 설정' })
  async setReorderPoint(
    @Args('input') input: SetReorderPointInput
  ): Promise<InventoryItem> {
    const entity = await this.inventoryItemRepository.findOne({
      where: { storeId: input.storeId, sku: input.sku },
    });

    if (!entity) {
      throw new Error('재고 항목을 찾을 수 없습니다.');
    }

    entity.reorderPoint = input.reorderPoint;
    const updated = await this.inventoryItemRepository.save(entity);
    return this.mapInventoryItemEntityToModel(updated);
  }

  @Mutation(() => InventoryItem, { description: '재고 조정 (기존)' })
  async adjustInventory(
    @Args('storeId', { type: () => ID }) storeId: string,
    @Args('sku', { type: () => ID }) sku: string,
    @Args('delta') delta: number,
    @Args('reason', { nullable: true }) reason?: string
  ): Promise<InventoryItem> {
    const entity = await this.inventoryItemRepository.findOne({
      where: { storeId, sku },
    });

    if (!entity) {
      throw new Error('재고 항목을 찾을 수 없습니다.');
    }

    const newQuantity = Number(entity.quantityOnHand) + delta;
    if (newQuantity < 0) {
      throw new Error('재고 수량이 음수가 될 수 없습니다.');
    }

    entity.quantityOnHand = newQuantity;
    const updated = await this.inventoryItemRepository.save(entity);
    return this.mapInventoryItemEntityToModel(updated);
  }

  @Mutation(() => InventoryItem, { description: '재고 실사 (기존)' })
  async reconcileInventory(
    @Args('storeId', { type: () => ID }) storeId: string,
    @Args('sku', { type: () => ID }) sku: string,
    @Args('quantity') quantity: number,
    @Args('reason', { nullable: true }) reason?: string
  ): Promise<InventoryItem> {
    // reconcileInventory는 submitInventoryCount와 동일한 로직
    return this.submitInventoryCount({
      storeId,
      sku,
      quantity,
      notes: reason,
    });
  }

  // 엔티티를 GraphQL 모델로 변환
  private mapInventoryItemEntityToModel(
    entity: InventoryItemEntity
  ): InventoryItem {
    return {
      storeId: entity.storeId,
      sku: entity.sku,
      quantityOnHand: Number(entity.quantityOnHand),
      reserved: Number(entity.reserved),
      reorderPoint: Number(entity.reorderPoint),
      lastAuditAt: entity.lastAuditAt?.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  private mapInventoryAuditEntityToModel(
    entity: InventoryAuditEntity
  ): InventoryAudit {
    return {
      id: entity.id,
      storeId: entity.storeId,
      sku: entity.sku,
      previousQuantity: Number(entity.previousQuantity),
      newQuantity: Number(entity.newQuantity),
      auditDate: entity.auditDate.toISOString(),
      performedBy: entity.performedBy,
      notes: entity.notes,
    };
  }

  private mapProductEntityToModel(entity: ProductEntity): Product {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      unitPrice: Number(entity.unitPrice),
      category: entity.category,
      isActive: entity.isActive,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
