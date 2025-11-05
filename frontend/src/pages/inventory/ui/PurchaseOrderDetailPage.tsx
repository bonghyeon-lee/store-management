import { gql, useMutation, useQuery } from '@apollo/client';
import { formatDateTime } from '@shared/lib/utils/date';
import { Button } from '@shared/ui/Button';
import { Loading } from '@shared/ui/Loading';
import { ProtectedRoute } from '@shared/ui/ProtectedRoute';
import React, { useState } from 'react';

const GET_PURCHASE_ORDER = gql`
  query GetPurchaseOrder($id: ID!) {
    purchaseOrder(id: $id) {
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

const APPROVE_PURCHASE_ORDER = gql`
  mutation ApprovePurchaseOrder($id: ID!, $approvedQuantity: Int!, $notes: String) {
    approvePurchaseOrder(id: $id, approvedQuantity: $approvedQuantity, notes: $notes) {
      id
      status
      approvedQuantity
      approvedBy
      approvedAt
      notes
    }
  }
`;

const REJECT_PURCHASE_ORDER = gql`
  mutation RejectPurchaseOrder($id: ID!, $notes: String!) {
    rejectPurchaseOrder(id: $id, notes: $notes) {
      id
      status
      notes
    }
  }
`;

const RECEIVE_INVENTORY = gql`
  mutation ReceiveInventory($purchaseOrderId: ID!, $receivedQuantity: Int!, $notes: String) {
    receiveInventory(
      purchaseOrderId: $purchaseOrderId
      receivedQuantity: $receivedQuantity
      notes: $notes
    ) {
      id
      status
      receivedQuantity
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

interface PurchaseOrderDetailPageProps {
  purchaseOrderId: string;
}

export const PurchaseOrderDetailPage: React.FC<PurchaseOrderDetailPageProps> = ({
  purchaseOrderId,
}) => {
  const [approveQuantity, setApproveQuantity] = useState('');
  const [receiveQuantity, setReceiveQuantity] = useState('');
  const [notes, setNotes] = useState('');

  const { data, loading, error, refetch } = useQuery<{
    purchaseOrder: PurchaseOrder;
  }>(GET_PURCHASE_ORDER, {
    variables: { id: purchaseOrderId },
    errorPolicy: 'all',
  });

  const [approveOrder] = useMutation(APPROVE_PURCHASE_ORDER, {
    onCompleted: () => {
      refetch();
      alert('발주가 승인되었습니다.');
      setApproveQuantity('');
      setNotes('');
    },
    onError: (err) => {
      alert('승인 중 오류가 발생했습니다: ' + err.message);
    },
  });

  const [rejectOrder] = useMutation(REJECT_PURCHASE_ORDER, {
    onCompleted: () => {
      refetch();
      alert('발주가 거부되었습니다.');
      setNotes('');
    },
    onError: (err) => {
      alert('거부 중 오류가 발생했습니다: ' + err.message);
    },
  });

  const [receiveInventory] = useMutation(RECEIVE_INVENTORY, {
    onCompleted: () => {
      refetch();
      alert('입고 처리가 완료되었습니다.');
      setReceiveQuantity('');
      setNotes('');
    },
    onError: (err) => {
      alert('입고 처리 중 오류가 발생했습니다: ' + err.message);
    },
  });

  const handleApprove = async () => {
    if (!approveQuantity) {
      alert('승인 수량을 입력하세요.');
      return;
    }
    const quantity = parseInt(approveQuantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      alert('유효한 승인 수량을 입력하세요.');
      return;
    }
    await approveOrder({
      variables: {
        id: purchaseOrderId,
        approvedQuantity: quantity,
        notes: notes || undefined,
      },
    });
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      alert('거부 사유를 입력하세요.');
      return;
    }
    await rejectOrder({
      variables: {
        id: purchaseOrderId,
        notes: notes.trim(),
      },
    });
  };

  const handleReceive = async () => {
    if (!receiveQuantity) {
      alert('입고 수량을 입력하세요.');
      return;
    }
    const quantity = parseInt(receiveQuantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      alert('유효한 입고 수량을 입력하세요.');
      return;
    }
    await receiveInventory({
      variables: {
        purchaseOrderId,
        receivedQuantity: quantity,
        notes: notes || undefined,
      },
    });
  };

  if (loading) return <Loading message="발주 정보를 불러오는 중..." />;
  if (error)
    return (
      <div style={{ padding: 20, color: 'red' }}>오류: {error.message}</div>
    );

  const order = data?.purchaseOrder;
  if (!order) {
    return (
      <ProtectedRoute>
        <div style={{ padding: 20 }}>
          <div style={{ color: 'red' }}>발주를 찾을 수 없습니다.</div>
          <Button onClick={() => (window.location.href = '/inventory/purchase-orders')}>
            목록으로
          </Button>
        </div>
      </ProtectedRoute>
    );
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

  const statusStyle = getStatusColor(order.status);

  return (
    <ProtectedRoute>
      <div style={{ padding: 20 }}>
        <div style={{ marginBottom: 20 }}>
          <Button onClick={() => (window.location.href = '/inventory/purchase-orders')}>
            ← 목록으로
          </Button>
        </div>

        <h1 style={{ marginBottom: 20 }}>발주 상세</h1>

        <div style={{ marginBottom: 24 }}>
          <table
            style={{
              width: '100%',
              maxWidth: 800,
              borderCollapse: 'collapse',
              border: '1px solid #ddd',
            }}
          >
            <tbody>
              <tr>
                <td
                  style={{
                    padding: 12,
                    background: '#f5f5f5',
                    border: '1px solid #ddd',
                    width: '30%',
                  }}
                >
                  발주 ID
                </td>
                <td style={{ padding: 12, border: '1px solid #ddd' }}>{order.id}</td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: 12,
                    background: '#f5f5f5',
                    border: '1px solid #ddd',
                  }}
                >
                  지점 ID
                </td>
                <td style={{ padding: 12, border: '1px solid #ddd' }}>{order.storeId}</td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: 12,
                    background: '#f5f5f5',
                    border: '1px solid #ddd',
                  }}
                >
                  SKU
                </td>
                <td style={{ padding: 12, border: '1px solid #ddd' }}>{order.sku}</td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: 12,
                    background: '#f5f5f5',
                    border: '1px solid #ddd',
                  }}
                >
                  요청 수량
                </td>
                <td style={{ padding: 12, border: '1px solid #ddd' }}>
                  {order.requestedQuantity}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: 12,
                    background: '#f5f5f5',
                    border: '1px solid #ddd',
                  }}
                >
                  승인 수량
                </td>
                <td style={{ padding: 12, border: '1px solid #ddd' }}>
                  {order.approvedQuantity ?? '-'}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: 12,
                    background: '#f5f5f5',
                    border: '1px solid #ddd',
                  }}
                >
                  입고 수량
                </td>
                <td style={{ padding: 12, border: '1px solid #ddd' }}>
                  {order.receivedQuantity ?? '-'}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: 12,
                    background: '#f5f5f5',
                    border: '1px solid #ddd',
                  }}
                >
                  상태
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
              </tr>
              <tr>
                <td
                  style={{
                    padding: 12,
                    background: '#f5f5f5',
                    border: '1px solid #ddd',
                  }}
                >
                  요청자
                </td>
                <td style={{ padding: 12, border: '1px solid #ddd' }}>{order.requestedBy}</td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: 12,
                    background: '#f5f5f5',
                    border: '1px solid #ddd',
                  }}
                >
                  요청일
                </td>
                <td style={{ padding: 12, border: '1px solid #ddd' }}>
                  {formatDateTime(order.requestedAt)}
                </td>
              </tr>
              {order.approvedBy && (
                <tr>
                  <td
                    style={{
                      padding: 12,
                      background: '#f5f5f5',
                      border: '1px solid #ddd',
                    }}
                  >
                    승인자
                  </td>
                  <td style={{ padding: 12, border: '1px solid #ddd' }}>
                    {order.approvedBy}
                  </td>
                </tr>
              )}
              {order.approvedAt && (
                <tr>
                  <td
                    style={{
                      padding: 12,
                      background: '#f5f5f5',
                      border: '1px solid #ddd',
                    }}
                  >
                    승인일
                  </td>
                  <td style={{ padding: 12, border: '1px solid #ddd' }}>
                    {formatDateTime(order.approvedAt)}
                  </td>
                </tr>
              )}
              {order.receivedAt && (
                <tr>
                  <td
                    style={{
                      padding: 12,
                      background: '#f5f5f5',
                      border: '1px solid #ddd',
                    }}
                  >
                    입고일
                  </td>
                  <td style={{ padding: 12, border: '1px solid #ddd' }}>
                    {formatDateTime(order.receivedAt)}
                  </td>
                </tr>
              )}
              {order.notes && (
                <tr>
                  <td
                    style={{
                      padding: 12,
                      background: '#f5f5f5',
                      border: '1px solid #ddd',
                    }}
                  >
                    메모
                  </td>
                  <td style={{ padding: 12, border: '1px solid #ddd' }}>{order.notes}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {order.status === 'PENDING' && (
          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>발주 승인/거부</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4 }}>승인 수량</label>
                <input
                  type="number"
                  value={approveQuantity}
                  onChange={(e) => setApproveQuantity(e.target.value)}
                  placeholder={order.requestedQuantity.toString()}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #ddd',
                    width: '100%',
                    maxWidth: 300,
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4 }}>메모 (선택사항)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="메모를 입력하세요"
                  rows={3}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #ddd',
                    width: '100%',
                    maxWidth: 500,
                    fontFamily: 'inherit',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button onClick={handleApprove} style={{ background: '#28a745', color: '#fff' }}>
                  승인
                </Button>
                <Button onClick={handleReject} style={{ background: '#dc3545', color: '#fff' }}>
                  거부
                </Button>
              </div>
            </div>
          </div>
        )}

        {order.status === 'APPROVED' && (
          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>입고 처리</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4 }}>
                  입고 수량 (승인 수량: {order.approvedQuantity})
                </label>
                <input
                  type="number"
                  value={receiveQuantity}
                  onChange={(e) => setReceiveQuantity(e.target.value)}
                  placeholder={order.approvedQuantity?.toString() || '0'}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #ddd',
                    width: '100%',
                    maxWidth: 300,
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4 }}>메모 (선택사항)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="메모를 입력하세요"
                  rows={3}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #ddd',
                    width: '100%',
                    maxWidth: 500,
                    fontFamily: 'inherit',
                  }}
                />
              </div>
              <div>
                <Button
                  onClick={handleReceive}
                  style={{ background: '#007bff', color: '#fff' }}
                >
                  입고 처리
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

