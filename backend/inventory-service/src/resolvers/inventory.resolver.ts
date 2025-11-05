import {
  Query,
  Resolver,
  Args,
  Mutation,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
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

// 인메모리 데이터 저장소 (MVP 단계)
const inventoryItems: Map<string, InventoryItem> = new Map();
const inventoryAudits: InventoryAudit[] = [];

// Product 데이터 (product.resolver.ts와 공유)
// 실제로는 별도 서비스나 모듈에서 가져와야 하지만, MVP 단계에서는 인메모리 사용
const products: Map<string, Product> = new Map();

// 키 생성 함수
const getInventoryKey = (storeId: string, sku: string) => `${storeId}:${sku}`;

// Product DataLoader 생성 함수
const createProductLoader = (): DataLoader<string, Product | null> => {
  return new DataLoader<string, Product | null>(
    async (productIds: readonly string[]) => {
      // 배치로 Product 조회
      return productIds.map((id) => products.get(id) || null);
    }
  );
};

// 초기 샘플 데이터
const initializeSampleData = () => {
  const now = new Date().toISOString();

  // Product 데이터 초기화 (product.resolver.ts와 동일한 데이터)
  products.set('SKU-001', {
    id: 'SKU-001',
    name: '샘플 상품 1',
    description: '테스트용 상품 1',
    unitPrice: 10000,
    category: '일반',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });
  products.set('SKU-002', {
    id: 'SKU-002',
    name: '샘플 상품 2',
    description: '테스트용 상품 2',
    unitPrice: 25000,
    category: '일반',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });
  products.set('SKU-003', {
    id: 'SKU-003',
    name: '샘플 상품 3',
    description: '테스트용 상품 3',
    unitPrice: 39900,
    category: '특가',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  // InventoryItem 데이터 초기화
  inventoryItems.set('STORE-001:SKU-001', {
    storeId: 'STORE-001',
    sku: 'SKU-001',
    quantityOnHand: 50,
    reserved: 5,
    reorderPoint: 30,
    lastAuditAt: now,
    updatedAt: now,
  });
  inventoryItems.set('STORE-001:SKU-002', {
    storeId: 'STORE-001',
    sku: 'SKU-002',
    quantityOnHand: 20,
    reserved: 2,
    reorderPoint: 25,
    lastAuditAt: now,
    updatedAt: now,
  });
};

initializeSampleData();

@Resolver(() => InventoryItem)
export class InventoryResolver {
  private productLoader: DataLoader<string, Product | null>;

  constructor() {
    // DataLoader 초기화 (실제로는 컨텍스트에서 가져와야 함)
    this.productLoader = createProductLoader();
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
  inventoryItem(
    @Args('storeId', { type: () => ID }) storeId: string,
    @Args('sku', { type: () => ID }) sku: string
  ): InventoryItem | null {
    const key = getInventoryKey(storeId, sku);
    return inventoryItems.get(key) || null;
  }

  @Query(() => [InventoryItem], { description: '지점별 재고 목록 조회' })
  storeInventories(
    @Args('storeId', { type: () => ID }) storeId: string,
    @Args('sku', { type: () => ID, nullable: true }) sku?: string
  ): InventoryItem[] {
    const items = Array.from(inventoryItems.values());
    let filtered = items.filter((item) => item.storeId === storeId);

    if (sku) {
      filtered = filtered.filter((item) => item.sku === sku);
    }

    return filtered;
  }

  @Query(() => [InventoryItem], { description: 'SKU별 재고 조회 (모든 지점)' })
  skuInventories(
    @Args('sku', { type: () => ID }) sku: string
  ): InventoryItem[] {
    const items = Array.from(inventoryItems.values());
    return items.filter((item) => item.sku === sku);
  }

  @Query(() => [InventoryAudit], { description: '재고 실사 이력 조회' })
  inventoryAuditHistory(
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
    @Args('storeId', { type: () => ID, nullable: true }) storeId?: string,
    @Args('sku', { type: () => ID, nullable: true }) sku?: string
  ): InventoryAudit[] {
    let filtered = inventoryAudits.filter((audit) => {
      return audit.auditDate >= startDate && audit.auditDate <= endDate;
    });

    if (storeId) {
      filtered = filtered.filter((audit) => audit.storeId === storeId);
    }

    if (sku) {
      filtered = filtered.filter((audit) => audit.sku === sku);
    }

    return filtered;
  }

  @Query(() => [ReorderRecommendation], {
    description: '리오더 추천 목록 조회',
  })
  reorderRecommendations(
    @Args('storeId', { type: () => ID, nullable: true }) storeId?: string,
    @Args('sku', { type: () => ID, nullable: true }) sku?: string
  ): ReorderRecommendation[] {
    const items = Array.from(inventoryItems.values());
    let filtered = items.filter(
      (item) => item.quantityOnHand <= item.reorderPoint
    );

    if (storeId) {
      filtered = filtered.filter((item) => item.storeId === storeId);
    }

    if (sku) {
      filtered = filtered.filter((item) => item.sku === sku);
    }

    // 리오더 추천 생성
    const recommendations: ReorderRecommendation[] = filtered.map((item) => {
      const shortage = item.reorderPoint - item.quantityOnHand;
      const recommendedQuantity = Math.max(
        item.reorderPoint * 2 - item.quantityOnHand,
        shortage
      );

      // 우선순위 계산 (재고 부족 정도 기준)
      const shortageRatio = shortage / item.reorderPoint;
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

      return {
        storeId: item.storeId,
        sku: item.sku,
        productName: `상품-${item.sku}`,
        currentQuantity: item.quantityOnHand,
        reorderPoint: item.reorderPoint,
        recommendedQuantity,
        priority,
        urgency,
      };
    });

    // 우선순위로 정렬
    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  @Mutation(() => InventoryItem, { description: '재고 실사 입력' })
  submitInventoryCount(
    @Args('input') input: SubmitInventoryCountInput
  ): InventoryItem {
    const key = getInventoryKey(input.storeId, input.sku);
    const existing = inventoryItems.get(key);

    const previousQuantity = existing?.quantityOnHand || 0;
    const now = new Date().toISOString();

    // 재고 실사 이력 기록
    const audit: InventoryAudit = {
      id: `AUDIT-${inventoryAudits.length + 1}`,
      storeId: input.storeId,
      sku: input.sku,
      previousQuantity,
      newQuantity: input.quantity,
      auditDate: now,
      performedBy: 'USER-001', // 실제로는 컨텍스트에서 가져옴
      notes: input.notes,
    };

    inventoryAudits.push(audit);

    // 재고 업데이트
    const inventoryItem: InventoryItem = {
      storeId: input.storeId,
      sku: input.sku,
      quantityOnHand: input.quantity,
      reserved: existing?.reserved || 0,
      reorderPoint: existing?.reorderPoint || 0,
      lastAuditAt: now,
      updatedAt: now,
    };

    inventoryItems.set(key, inventoryItem);
    return inventoryItem;
  }

  @Mutation(() => InventoryItem, { description: '안전재고 임계치 설정' })
  setReorderPoint(@Args('input') input: SetReorderPointInput): InventoryItem {
    const key = getInventoryKey(input.storeId, input.sku);
    const existing = inventoryItems.get(key);

    if (!existing) {
      throw new Error('재고 항목을 찾을 수 없습니다.');
    }

    const updated: InventoryItem = {
      ...existing,
      reorderPoint: input.reorderPoint,
      updatedAt: new Date().toISOString(),
    };

    inventoryItems.set(key, updated);
    return updated;
  }

  @Mutation(() => InventoryItem, { description: '재고 조정 (기존)' })
  adjustInventory(
    @Args('storeId', { type: () => ID }) storeId: string,
    @Args('sku', { type: () => ID }) sku: string,
    @Args('delta') delta: number,
    @Args('reason', { nullable: true }) reason?: string
  ): InventoryItem {
    const key = getInventoryKey(storeId, sku);
    const existing = inventoryItems.get(key);

    if (!existing) {
      throw new Error('재고 항목을 찾을 수 없습니다.');
    }

    const newQuantity = existing.quantityOnHand + delta;
    if (newQuantity < 0) {
      throw new Error('재고 수량이 음수가 될 수 없습니다.');
    }

    const updated: InventoryItem = {
      ...existing,
      quantityOnHand: newQuantity,
      updatedAt: new Date().toISOString(),
    };

    inventoryItems.set(key, updated);
    return updated;
  }

  @Mutation(() => InventoryItem, { description: '재고 실사 (기존)' })
  reconcileInventory(
    @Args('storeId', { type: () => ID }) storeId: string,
    @Args('sku', { type: () => ID }) sku: string,
    @Args('quantity') quantity: number,
    @Args('reason', { nullable: true }) reason?: string
  ): InventoryItem {
    // reconcileInventory는 submitInventoryCount와 동일한 로직
    const key = getInventoryKey(storeId, sku);
    const existing = inventoryItems.get(key);

    const previousQuantity = existing?.quantityOnHand || 0;
    const now = new Date().toISOString();

    // 재고 실사 이력 기록
    const audit: InventoryAudit = {
      id: `AUDIT-${inventoryAudits.length + 1}`,
      storeId,
      sku,
      previousQuantity,
      newQuantity: quantity,
      auditDate: now,
      performedBy: 'USER-001', // 실제로는 컨텍스트에서 가져옴
      notes: reason,
    };

    inventoryAudits.push(audit);

    // 재고 업데이트
    const inventoryItem: InventoryItem = {
      storeId,
      sku,
      quantityOnHand: quantity,
      reserved: existing?.reserved || 0,
      reorderPoint: existing?.reorderPoint || 0,
      lastAuditAt: now,
      updatedAt: now,
    };

    inventoryItems.set(key, inventoryItem);
    return inventoryItem;
  }
}
