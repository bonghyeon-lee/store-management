import { Query, Resolver, Args, Mutation } from '@nestjs/graphql';

type PurchaseOrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RECEIVED';

interface PurchaseOrder {
  id: string;
  storeId: string;
  sku: string;
  requestedQuantity: number;
  approvedQuantity: number | null;
  receivedQuantity: number | null;
  status: PurchaseOrderStatus;
  requestedBy: string;
  approvedBy: string | null;
  requestedAt: string;
  approvedAt: string | null;
  receivedAt: string | null;
  notes: string | null;
}

// 인메모리 데이터 저장소 (MVP 단계)
const purchaseOrders: Map<string, PurchaseOrder> = new Map();

// 키 생성 함수
const generatePurchaseOrderId = () =>
  `PO-${String(purchaseOrders.size + 1).padStart(6, '0')}`;

@Resolver('PurchaseOrder')
export class PurchaseOrderResolver {
  @Query('purchaseOrder')
  purchaseOrder(@Args('id') id: string): PurchaseOrder | null {
    return purchaseOrders.get(id) || null;
  }

  @Query('purchaseOrders')
  purchaseOrders(
    @Args('storeId') storeId: string | undefined,
    @Args('sku') sku: string | undefined,
    @Args('status') status: PurchaseOrderStatus | undefined,
  ): PurchaseOrder[] {
    let result = Array.from(purchaseOrders.values());

    if (storeId) {
      result = result.filter((po) => po.storeId === storeId);
    }

    if (sku) {
      result = result.filter((po) => po.sku === sku);
    }

    if (status) {
      result = result.filter((po) => po.status === status);
    }

    return result;
  }

  @Mutation('createPurchaseOrder')
  createPurchaseOrder(
    @Args('input')
    input: {
      storeId: string;
      sku: string;
      requestedQuantity: number;
      notes?: string;
    },
  ): PurchaseOrder {
    const id = generatePurchaseOrderId();
    const now = new Date().toISOString();

    const purchaseOrder: PurchaseOrder = {
      id,
      storeId: input.storeId,
      sku: input.sku,
      requestedQuantity: input.requestedQuantity,
      approvedQuantity: null,
      receivedQuantity: null,
      status: 'PENDING',
      requestedBy: 'USER-001', // 실제로는 컨텍스트에서 가져옴
      approvedBy: null,
      requestedAt: now,
      approvedAt: null,
      receivedAt: null,
      notes: input.notes || null,
    };

    purchaseOrders.set(id, purchaseOrder);
    return purchaseOrder;
  }

  @Mutation('approvePurchaseOrder')
  approvePurchaseOrder(
    @Args('id') id: string,
    @Args('approvedQuantity') approvedQuantity: number,
    @Args('notes') notes: string | undefined,
  ): PurchaseOrder {
    const purchaseOrder = purchaseOrders.get(id);

    if (!purchaseOrder) {
      throw new Error(`발주를 찾을 수 없습니다: ${id}`);
    }

    if (purchaseOrder.status !== 'PENDING') {
      throw new Error('승인 대기 상태의 발주만 승인할 수 있습니다.');
    }

    const now = new Date().toISOString();

    purchaseOrder.status = 'APPROVED';
    purchaseOrder.approvedQuantity = approvedQuantity;
    purchaseOrder.approvedBy = 'MANAGER-001'; // 실제로는 컨텍스트에서 가져옴
    purchaseOrder.approvedAt = now;
    if (notes) {
      purchaseOrder.notes = notes;
    }

    purchaseOrders.set(id, purchaseOrder);
    return purchaseOrder;
  }

  @Mutation('rejectPurchaseOrder')
  rejectPurchaseOrder(
    @Args('id') id: string,
    @Args('notes') notes: string,
  ): PurchaseOrder {
    const purchaseOrder = purchaseOrders.get(id);

    if (!purchaseOrder) {
      throw new Error(`발주를 찾을 수 없습니다: ${id}`);
    }

    if (purchaseOrder.status !== 'PENDING') {
      throw new Error('승인 대기 상태의 발주만 거부할 수 있습니다.');
    }

    purchaseOrder.status = 'REJECTED';
    purchaseOrder.approvedBy = 'MANAGER-001'; // 실제로는 컨텍스트에서 가져옴
    purchaseOrder.approvedAt = new Date().toISOString();
    purchaseOrder.notes = notes;

    purchaseOrders.set(id, purchaseOrder);
    return purchaseOrder;
  }

  @Mutation('receiveInventory')
  receiveInventory(
    @Args('purchaseOrderId') purchaseOrderId: string,
    @Args('receivedQuantity') receivedQuantity: number,
    @Args('notes') notes: string | undefined,
  ): PurchaseOrder {
    const purchaseOrder = purchaseOrders.get(purchaseOrderId);

    if (!purchaseOrder) {
      throw new Error(`발주를 찾을 수 없습니다: ${purchaseOrderId}`);
    }

    if (purchaseOrder.status !== 'APPROVED') {
      throw new Error('승인된 발주만 입고 처리할 수 있습니다.');
    }

    const now = new Date().toISOString();

    purchaseOrder.status = 'RECEIVED';
    purchaseOrder.receivedQuantity = receivedQuantity;
    purchaseOrder.receivedAt = now;
    if (notes) {
      purchaseOrder.notes = notes;
    }

    purchaseOrders.set(purchaseOrderId, purchaseOrder);

    // 입고 시 재고 자동 업데이트 (InventoryItem 업데이트)
    // 실제로는 InventoryService를 호출하거나 이벤트를 발행해야 함
    // MVP 단계에서는 단순히 PurchaseOrder만 업데이트

    return purchaseOrder;
  }
}

