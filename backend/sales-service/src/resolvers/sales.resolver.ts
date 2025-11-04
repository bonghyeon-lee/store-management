import { Query, Resolver, Args, Mutation } from '@nestjs/graphql';

type OrderStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'CANCELLED';

interface LineItem {
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  storeId: string;
  orderId: string;
  createdAt: string;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  lineItems: LineItem[];
}

@Resolver('Order')
export class SalesResolver {
  @Query('order')
  order(
    @Args('storeId') storeId: string,
    @Args('orderId') orderId: string,
  ): Order | null {
    return {
      storeId,
      orderId,
      createdAt: new Date().toISOString(),
      currency: 'USD',
      status: 'PAID',
      lineItems: [
        { sku: 'SKU-1', name: 'Sample', unitPrice: 10, quantity: 2, subtotal: 20 },
      ],
      totalAmount: 20,
    };
  }

  @Mutation('recordSale')
  recordSale(
    @Args('storeId') storeId: string,
    @Args('orderId') orderId: string,
    @Args('currency') currency: string,
    @Args('lineItems') lineItems: Array<{ sku: string; name: string; unitPrice: number; quantity: number }>,
  ): Order {
    const items: LineItem[] = lineItems.map((li) => ({
      ...li,
      subtotal: li.unitPrice * li.quantity,
    }));
    const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);
    return {
      storeId,
      orderId,
      createdAt: new Date().toISOString(),
      currency,
      status: 'PAID',
      lineItems: items,
      totalAmount,
    };
  }

  @Mutation('refundOrder')
  refundOrder(
    @Args('storeId') storeId: string,
    @Args('orderId') orderId: string,
    @Args('amount') amount: number,
  ): Order {
    return {
      storeId,
      orderId,
      createdAt: new Date().toISOString(),
      currency: 'USD',
      status: 'REFUNDED',
      lineItems: [],
      totalAmount: -Math.abs(amount),
    };
  }
}


