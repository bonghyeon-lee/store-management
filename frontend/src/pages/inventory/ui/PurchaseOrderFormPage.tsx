import { gql, useMutation } from '@apollo/client';
import { Button } from '@shared/ui/Button';
import { ProtectedRoute } from '@shared/ui/ProtectedRoute';
import React, { useState } from 'react';

const CREATE_PURCHASE_ORDER = gql`
  mutation CreatePurchaseOrder($input: CreatePurchaseOrderInput!) {
    createPurchaseOrder(input: $input) {
      id
      storeId
      sku
      requestedQuantity
      status
      requestedBy
      requestedAt
      notes
    }
  }
`;

export const PurchaseOrderFormPage: React.FC = () => {
  const [storeId, setStoreId] = useState('');
  const [sku, setSku] = useState('');
  const [requestedQuantity, setRequestedQuantity] = useState('');
  const [notes, setNotes] = useState('');

  const [createOrder, { loading, error }] = useMutation(CREATE_PURCHASE_ORDER, {
    onCompleted: (data) => {
      alert('발주가 생성되었습니다.');
      window.location.href = `/inventory/purchase-orders/${data.createPurchaseOrder.id}`;
    },
    onError: (err) => {
      alert('발주 생성 중 오류가 발생했습니다: ' + err.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeId.trim()) {
      alert('지점 ID를 입력하세요.');
      return;
    }
    if (!sku.trim()) {
      alert('SKU를 입력하세요.');
      return;
    }
    if (!requestedQuantity) {
      alert('요청 수량을 입력하세요.');
      return;
    }

    const quantity = parseInt(requestedQuantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      alert('유효한 요청 수량을 입력하세요.');
      return;
    }

    await createOrder({
      variables: {
        input: {
          storeId: storeId.trim(),
          sku: sku.trim(),
          requestedQuantity: quantity,
          notes: notes.trim() || undefined,
        },
      },
    });
  };

  return (
    <ProtectedRoute>
      <div style={{ padding: 20 }}>
        <div style={{ marginBottom: 20 }}>
          <Button onClick={() => (window.location.href = '/inventory/purchase-orders')}>
            ← 목록으로
          </Button>
        </div>

        <h1 style={{ marginBottom: 20 }}>발주 생성</h1>

        {error && (
          <div
            style={{
              padding: 12,
              marginBottom: 20,
              background: '#f8d7da',
              color: '#721c24',
              borderRadius: 6,
            }}
          >
            오류: {error.message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            maxWidth: 600,
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: 20,
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              지점 ID <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              required
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #ddd',
                width: '100%',
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              SKU <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #ddd',
                width: '100%',
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              요청 수량 <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="number"
              value={requestedQuantity}
              onChange={(e) => setRequestedQuantity(e.target.value)}
              min="1"
              required
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #ddd',
                width: '100%',
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              메모 (선택사항)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #ddd',
                width: '100%',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              type="submit"
              disabled={loading}
              style={{ background: '#007bff', color: '#fff' }}
            >
              {loading ? '생성 중...' : '발주 생성'}
            </Button>
            <Button
              type="button"
              onClick={() => (window.location.href = '/inventory/purchase-orders')}
              style={{ background: '#6c757d', color: '#fff' }}
            >
              취소
            </Button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
};
