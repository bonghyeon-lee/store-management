import { Query, Resolver, Args, Mutation } from '@nestjs/graphql';

interface InventoryItem {
  storeId: string;
  sku: string;
  quantityOnHand: number;
  reserved: number;
  reorderPoint: number;
  lastAuditAt?: string | null;
  updatedAt: string;
}

interface InventoryAudit {
  id: string;
  storeId: string;
  sku: string;
  previousQuantity: number;
  newQuantity: number;
  auditDate: string;
  performedBy: string;
  notes?: string | null;
}

interface ReorderRecommendation {
  storeId: string;
  sku: string;
  productName: string;
  currentQuantity: number;
  reorderPoint: number;
  recommendedQuantity: number;
  priority: number;
  urgency: string;
}

// 인메모리 데이터 저장소 (MVP 단계)
const inventoryItems: Map<string, InventoryItem> = new Map();
const inventoryAudits: InventoryAudit[] = [];

// 키 생성 함수
const getInventoryKey = (storeId: string, sku: string) => `${storeId}:${sku}`;

// 초기 샘플 데이터
const initializeSampleData = () => {
  const now = new Date().toISOString();
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

@Resolver('InventoryItem')
export class InventoryResolver {
  @Query('inventoryItem')
  inventoryItem(
    @Args('storeId') storeId: string,
    @Args('sku') sku: string
  ): InventoryItem | null {
    const key = getInventoryKey(storeId, sku);
    return inventoryItems.get(key) || null;
  }

  @Query('storeInventories')
  storeInventories(
    @Args('storeId') storeId: string,
    @Args('sku') sku: string | undefined
  ): InventoryItem[] {
    const items = Array.from(inventoryItems.values());
    let filtered = items.filter((item) => item.storeId === storeId);

    if (sku) {
      filtered = filtered.filter((item) => item.sku === sku);
    }

    return filtered;
  }

  @Query('skuInventories')
  skuInventories(@Args('sku') sku: string): InventoryItem[] {
    const items = Array.from(inventoryItems.values());
    return items.filter((item) => item.sku === sku);
  }

  @Query('inventoryAuditHistory')
  inventoryAuditHistory(
    @Args('storeId') storeId: string | undefined,
    @Args('sku') sku: string | undefined,
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string
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

  @Query('reorderRecommendations')
  reorderRecommendations(
    @Args('storeId') storeId: string | undefined,
    @Args('sku') sku: string | undefined
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

  @Mutation('submitInventoryCount')
  submitInventoryCount(
    @Args('input')
    input: {
      storeId: string;
      sku: string;
      quantity: number;
      notes?: string;
    }
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
      notes: input.notes || null,
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

  @Mutation('setReorderPoint')
  setReorderPoint(
    @Args('input')
    input: {
      storeId: string;
      sku: string;
      reorderPoint: number;
    }
  ): InventoryItem {
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

  @Mutation('adjustInventory')
  adjustInventory(
    @Args('storeId') storeId: string,
    @Args('sku') sku: string,
    @Args('delta') delta: number,
    @Args('reason') reason: string | undefined
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

  @Mutation('reconcileInventory')
  reconcileInventory(
    @Args('storeId') storeId: string,
    @Args('sku') sku: string,
    @Args('quantity') quantity: number,
    @Args('reason') reason: string | undefined
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
      notes: reason || null,
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
