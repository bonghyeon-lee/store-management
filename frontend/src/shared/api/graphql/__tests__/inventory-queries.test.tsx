/**
 * Inventory GraphQL 쿼리 훅 테스트 예시
 *
 * 이 파일은 Inventory 관련 GraphQL 쿼리를 사용하는 컴포넌트를 테스트하는 방법을 보여줍니다.
 */

import { gql, useQuery } from '@apollo/client';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createMockQuery, TestApolloProvider } from '../../../../test/mock-apollo-client';

interface PurchaseOrder {
  id: string;
  storeId: string;
  sku: string;
  requestedQuantity: number;
  status: string;
}

// 테스트용 쿼리
const GET_PURCHASE_ORDERS = gql`
  query GetPurchaseOrders($storeId: ID, $status: PurchaseOrderStatus) {
    purchaseOrders(storeId: $storeId, status: $status) {
      id
      storeId
      sku
      requestedQuantity
      status
    }
  }
`;

// 테스트용 컴포넌트
function PurchaseOrderList({ storeId, status }: { storeId?: string; status?: string }) {
  const { data, loading, error } = useQuery(GET_PURCHASE_ORDERS, {
    variables: { storeId, status },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>발주 목록</h2>
      {data?.purchaseOrders.map((order: PurchaseOrder) => (
        <div key={order.id} data-testid={`order-${order.id}`}>
          발주 #{order.id} - 수량: {order.requestedQuantity} - 상태: {order.status}
        </div>
      ))}
    </div>
  );
}

describe('Inventory Queries', () => {
  it('should fetch and display purchase orders', async () => {
    const mocks = [
      createMockQuery(
        GET_PURCHASE_ORDERS,
        { storeId: '1', status: 'PENDING' },
        {
          purchaseOrders: [
            {
              id: '1',
              storeId: '1',
              sku: 'SKU001',
              requestedQuantity: 100,
              status: 'PENDING',
            },
            {
              id: '2',
              storeId: '1',
              sku: 'SKU002',
              requestedQuantity: 50,
              status: 'PENDING',
            },
          ],
        },
      ),
    ];

    render(
      <TestApolloProvider mocks={mocks}>
        <PurchaseOrderList storeId="1" status="PENDING" />
      </TestApolloProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('발주 목록')).toBeInTheDocument();
      expect(screen.getByTestId('order-1')).toHaveTextContent(
        '발주 #1 - 수량: 100 - 상태: PENDING',
      );
      expect(screen.getByTestId('order-2')).toHaveTextContent('발주 #2 - 수량: 50 - 상태: PENDING');
    });
  });
});
