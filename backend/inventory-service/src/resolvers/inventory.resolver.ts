import { Query, Resolver, Args, Mutation } from '@nestjs/graphql';

interface InventoryItem {
  storeId: string;
  sku: string;
  name: string;
  quantity: number;
  reserved: number;
  updatedAt: string;
}

@Resolver('InventoryItem')
export class InventoryResolver {
  @Query('inventoryItem')
  inventoryItem(
    @Args('storeId') storeId: string,
    @Args('sku') sku: string,
  ): InventoryItem | null {
    return {
      storeId,
      sku,
      name: `Item ${sku}`,
      quantity: 100,
      reserved: 5,
      updatedAt: new Date().toISOString(),
    };
  }

  @Mutation('adjustInventory')
  adjustInventory(
    @Args('storeId') storeId: string,
    @Args('sku') sku: string,
    @Args('delta') delta: number,
    @Args('reason') reason?: string,
  ): InventoryItem {
    const baseQty = 100;
    const quantity = baseQty + delta;
    return {
      storeId,
      sku,
      name: `Item ${sku}`,
      quantity,
      reserved: 5,
      updatedAt: new Date().toISOString(),
    };
  }

  @Mutation('reconcileInventory')
  reconcileInventory(
    @Args('storeId') storeId: string,
    @Args('sku') sku: string,
    @Args('quantity') quantity: number,
    @Args('reason') reason?: string,
  ): InventoryItem {
    return {
      storeId,
      sku,
      name: `Item ${sku}`,
      quantity,
      reserved: 5,
      updatedAt: new Date().toISOString(),
    };
  }
}


