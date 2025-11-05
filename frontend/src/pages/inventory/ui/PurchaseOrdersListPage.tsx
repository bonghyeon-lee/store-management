import { gql, useQuery } from '@apollo/client';
import { formatDateTime } from '@shared/lib/utils/date';
import { Button } from '@shared/ui/Button';
import { Loading } from '@shared/ui/Loading';
import { ProtectedRoute } from '@shared/ui/ProtectedRoute';
import React, { useState } from 'react';

const GET_PURCHASE_ORDERS = gql`
  query GetPurchaseOrders($storeId: ID, $sku: ID, $status: PurchaseOrderStatus) {
    purchaseOrders(storeId: $storeId, sku: $sku, status: $status) {
      id
      storeId
      sku
      requestedQuantity
      approvedQuantity
      receivedQuantity
      status
      requestedBy
      approvedBy
      requestedAt
      approvedAt
      receivedAt
      notes
    }
  }
`;

interface PurchaseOrder {
  id: string;
  storeId: string;
  sku: string;
  requestedQuantity: number;
  approvedQuantity: number | null;
  receivedQuantity: number | null;
  status: string;
  requestedBy: string;
  approvedBy: string | null;
  requestedAt: string;
  approvedAt: string | null;
  receivedAt: string | null;
  notes: string | null;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return { bg: '#fff3cd', color: '#856404' };
    case 'APPROVED':
      return { bg: '#d4edda', color: '#155724' };
    case 'REJECTED':
      return { bg: '#f8d7da', color: '#721c24' };
    case 'RECEIVED':
      return { bg: '#d1ecf1', color: '#0c5460' };
    default:
      return { bg: '#f5f5f5', color: '#666' };
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING':
      return '대기';
    case 'APPROVED':
      return '승인';
    case 'REJECTED':
      return '거부';
    case 'RECEIVED':
      return '입고완료';
    default:
      return status;
  }
};

export const PurchaseOrdersListPage: React.FC = () => {
  const [storeId, setStoreId] = useState('');
  const [sku, setSku] = useState('');
  const [status, setStatus] = useState<string>('');

  const { data, loading, error, refetch } = useQuery<{
    purchaseOrders: PurchaseOrder[];
  }>(GET_PURCHASE_ORDERS, {
    variables: {
      storeId: storeId || undefined,
      sku: sku || undefined,
      status:
        status && ['PENDING', 'APPROVED', 'REJECTED', 'RECEIVED'].includes(status)
          ? status
          : undefined,
    },
    errorPolicy: 'all',
  });

  if (loading) return <Loading message="발주 목록을 불러오는 중..." />;
  if (error)
    return (
      <div style={{ padding: 20, color: 'red' }}>오류: {error.message}</div>
    );

  const purchaseOrders = data?.purchaseOrders || [];

  return (
    <ProtectedRoute>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1>발주 목록</h1>
          <Button onClick={() => (window.location.href = '/inventory/purchase-orders/new')}>
            발주 생성
          </Button>
        </div>

        <div style={{ marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="지점 ID"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #ddd',
            }}
          />
          <input
            type="text"
            placeholder="SKU"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #ddd',
            }}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #ddd',
            }}
          >
            <option value="">전체 상태</option>
            <option value="PENDING">대기</option>
            <option value="APPROVED">승인</option>
            <option value="REJECTED">거부</option>
            <option value="RECEIVED">입고완료</option>
          </select>
          <Button onClick={() => refetch()}>검색</Button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid #ddd',
            }}
          >
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>
                  발주 ID
                </th>
                <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>
                  지점 ID
                </th>
                <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>
                  SKU
                </th>
                <th style={{ padding: 12, textAlign: 'right', border: '1px solid #ddd' }}>
                  요청 수량
                </th>
                <th style={{ padding: 12, textAlign: 'right', border: '1px solid #ddd' }}>
                  승인 수량
                </th>
                <th style={{ padding: 12, textAlign: 'right', border: '1px solid #ddd' }}>
                  입고 수량
                </th>
                <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>
                  상태
                </th>
                <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>
                  요청일
                </th>
                <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>
                  작업
                </th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{ padding: 20, textAlign: 'center', color: '#666' }}
                  >
                    발주 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                purchaseOrders.map((order) => {
                  const statusStyle = getStatusColor(order.status);
                  return (
                    <tr key={order.id}>
                      <td style={{ padding: 12, border: '1px solid #ddd' }}>
                        <a
                          href={`/inventory/purchase-orders/${order.id}`}
                          style={{ color: '#007bff', textDecoration: 'none' }}
                        >
                          {order.id}
                        </a>
                      </td>
                      <td style={{ padding: 12, border: '1px solid #ddd' }}>
                        {order.storeId}
                      </td>
                      <td style={{ padding: 12, border: '1px solid #ddd' }}>{order.sku}</td>
                      <td style={{ padding: 12, textAlign: 'right', border: '1px solid #ddd' }}>
                        {order.requestedQuantity}
                      </td>
                      <td style={{ padding: 12, textAlign: 'right', border: '1px solid #ddd' }}>
                        {order.approvedQuantity ?? '-'}
                      </td>
                      <td style={{ padding: 12, textAlign: 'right', border: '1px solid #ddd' }}>
                        {order.receivedQuantity ?? '-'}
                      </td>
                      <td style={{ padding: 12, border: '1px solid #ddd' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: 4,
                            background: statusStyle.bg,
                            color: statusStyle.color,
                          }}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td style={{ padding: 12, border: '1px solid #ddd' }}>
                        {formatDateTime(order.requestedAt)}
                      </td>
                      <td style={{ padding: 12, border: '1px solid #ddd' }}>
                        <Button
                          onClick={() =>
                            (window.location.href = `/inventory/purchase-orders/${order.id}`)
                          }
                          style={{ padding: '4px 8px', fontSize: 12 }}
                        >
                          상세
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
};

