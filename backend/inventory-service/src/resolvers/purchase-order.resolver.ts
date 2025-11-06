import { Query, Resolver, Args, Mutation, ID } from '@nestjs/graphql';
import {
  PurchaseOrder,
  PurchaseOrderStatus,
} from '../models/purchase-order.model';
import { CreatePurchaseOrderInput } from '../models/inputs.model';
import { inventoryItems, inventoryAudits } from './inventory.resolver';

// 인메모리 데이터 저장소 (MVP 단계)
const purchaseOrders: Map<string, PurchaseOrder> = new Map();

// 키 생성 함수
const generatePurchaseOrderId = () =>
  `PO-${String(purchaseOrders.size + 1).padStart(6, '0')}`;

@Resolver(() => PurchaseOrder)
export class PurchaseOrderResolver {
  @Query(() => PurchaseOrder, { nullable: true, description: '발주 조회' })
  purchaseOrder(@Args('id') id: string): PurchaseOrder | null {
    return purchaseOrders.get(id) || null;
  }

  @Query(() => [PurchaseOrder], { description: '발주 목록 조회' })
  purchaseOrders(
    @Args('storeId', { type: () => ID, nullable: true }) storeId?: string,
    @Args('sku', { type: () => ID, nullable: true }) sku?: string,
    @Args('status', { type: () => PurchaseOrderStatus, nullable: true })
    status?: PurchaseOrderStatus
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

  @Mutation(() => PurchaseOrder, { description: '발주 요청 생성' })
  createPurchaseOrder(
    @Args('input') input: CreatePurchaseOrderInput
  ): PurchaseOrder {
    const id = generatePurchaseOrderId();
    const now = new Date().toISOString();

    const purchaseOrder: PurchaseOrder = {
      id,
      storeId: input.storeId,
      sku: input.sku,
      requestedQuantity: input.requestedQuantity,
      approvedQuantity: undefined,
      receivedQuantity: undefined,
      status: PurchaseOrderStatus.PENDING,
      requestedBy: 'USER-001', // 실제로는 컨텍스트에서 가져옴
      approvedBy: undefined,
      requestedAt: now,
      approvedAt: undefined,
      receivedAt: undefined,
      notes: input.notes,
    };

    purchaseOrders.set(id, purchaseOrder);
    return purchaseOrder;
  }

  @Mutation(() => PurchaseOrder, { description: '발주 승인' })
  approvePurchaseOrder(
    @Args('id') id: string,
    @Args('approvedQuantity') approvedQuantity: number,
    @Args('notes', { nullable: true }) notes?: string
  ): PurchaseOrder {
    const purchaseOrder = purchaseOrders.get(id);

    if (!purchaseOrder) {
      throw new Error(`발주를 찾을 수 없습니다: ${id}`);
    }

    if (purchaseOrder.status !== PurchaseOrderStatus.PENDING) {
      throw new Error('승인 대기 상태의 발주만 승인할 수 있습니다.');
    }

    const now = new Date().toISOString();

    purchaseOrder.status = PurchaseOrderStatus.APPROVED;
    purchaseOrder.approvedQuantity = approvedQuantity;
    purchaseOrder.approvedBy = 'MANAGER-001'; // 실제로는 컨텍스트에서 가져옴
    purchaseOrder.approvedAt = now;
    if (notes) {
      purchaseOrder.notes = notes;
    }

    purchaseOrders.set(id, purchaseOrder);
    return purchaseOrder;
  }

  @Mutation(() => PurchaseOrder, { description: '발주 거부' })
  rejectPurchaseOrder(
    @Args('id') id: string,
    @Args('notes') notes: string
  ): PurchaseOrder {
    const purchaseOrder = purchaseOrders.get(id);

    if (!purchaseOrder) {
      throw new Error(`발주를 찾을 수 없습니다: ${id}`);
    }

    if (purchaseOrder.status !== PurchaseOrderStatus.PENDING) {
      throw new Error('승인 대기 상태의 발주만 거부할 수 있습니다.');
    }

    purchaseOrder.status = PurchaseOrderStatus.REJECTED;
    purchaseOrder.approvedBy = 'MANAGER-001'; // 실제로는 컨텍스트에서 가져옴
    purchaseOrder.approvedAt = new Date().toISOString();
    purchaseOrder.notes = notes;

    purchaseOrders.set(id, purchaseOrder);
    return purchaseOrder;
  }

  @Mutation(() => PurchaseOrder, { description: '입고 처리' })
  receiveInventory(
    @Args('purchaseOrderId') purchaseOrderId: string,
    @Args('receivedQuantity') receivedQuantity: number,
    @Args('notes', { nullable: true }) notes?: string
  ): PurchaseOrder {
    const purchaseOrder = purchaseOrders.get(purchaseOrderId);

    if (!purchaseOrder) {
      throw new Error(`발주를 찾을 수 없습니다: ${purchaseOrderId}`);
    }

    if (purchaseOrder.status !== PurchaseOrderStatus.APPROVED) {
      throw new Error('승인된 발주만 입고 처리할 수 있습니다.');
    }

    const now = new Date().toISOString();

    purchaseOrder.status = PurchaseOrderStatus.RECEIVED;
    purchaseOrder.receivedQuantity = receivedQuantity;
    purchaseOrder.receivedAt = now;
    if (notes) {
      purchaseOrder.notes = notes;
    }

    purchaseOrders.set(purchaseOrderId, purchaseOrder);

    // 입고 시 재고 자동 업데이트
    const inventoryKey = `${purchaseOrder.storeId}:${purchaseOrder.sku}`;
    const existingInventory = inventoryItems.get(inventoryKey);

    if (existingInventory) {
      // 기존 재고에 입고 수량 추가
      const updatedInventory = {
        ...existingInventory,
        quantityOnHand: existingInventory.quantityOnHand + receivedQuantity,
        updatedAt: now,
      };
      inventoryItems.set(inventoryKey, updatedInventory);

      // 재고 실사 이력 기록
      inventoryAudits.push({
        id: `AUDIT-${inventoryAudits.length + 1}`,
        storeId: purchaseOrder.storeId,
        sku: purchaseOrder.sku,
        previousQuantity: existingInventory.quantityOnHand,
        newQuantity: updatedInventory.quantityOnHand,
        auditDate: now,
        performedBy: 'SYSTEM', // 입고 처리로 인한 자동 업데이트
        notes: `입고 처리: 발주 ${purchaseOrderId} (${receivedQuantity}개)`,
      });
    } else {
      // 재고 항목이 없으면 새로 생성
      const newInventory = {
        storeId: purchaseOrder.storeId,
        sku: purchaseOrder.sku,
        quantityOnHand: receivedQuantity,
        reserved: 0,
        reorderPoint: 0,
        lastAuditAt: now,
        updatedAt: now,
      };
      inventoryItems.set(inventoryKey, newInventory);

      // 재고 실사 이력 기록
      inventoryAudits.push({
        id: `AUDIT-${inventoryAudits.length + 1}`,
        storeId: purchaseOrder.storeId,
        sku: purchaseOrder.sku,
        previousQuantity: 0,
        newQuantity: receivedQuantity,
        auditDate: now,
        performedBy: 'SYSTEM',
        notes: `입고 처리: 발주 ${purchaseOrderId} (${receivedQuantity}개)`,
      });
    }

    return purchaseOrder;
  }
}
