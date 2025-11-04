import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { Button } from '@shared/ui/Button';
import { AddToCartButton } from '@features/add-to-cart/ui/AddToCartButton';
import { useAuth } from '@shared/lib/auth/auth-context';
import type { Product } from '@entities/product/model/types';

const ProductsQuery = gql`
  query Products {
    products {
      id
      name
      unitPrice
    }
  }
`;

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { data, loading, error } = useQuery<{ products: any[] }>(ProductsQuery, {
    errorPolicy: 'all',
  });

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>에러: {error.message}</p>;

  return (
    <section>
      <h1>Store Management System</h1>

      {isAuthenticated && (
        <div style={{ marginBottom: 24 }}>
          <h2>주요 기능</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button onClick={() => (window.location.href = '/employees')}>직원 관리</Button>
            <Button onClick={() => (window.location.href = '/attendance')}>출퇴근 기록</Button>
            <Button onClick={() => (window.location.href = '/attendance/pending')}>
              승인 대기 목록
            </Button>
            <Button onClick={() => (window.location.href = '/attendance/reports/daily')}>
              일별 리포트
            </Button>
            <Button onClick={() => (window.location.href = '/attendance/reports/weekly')}>
              주별 리포트
            </Button>
          </div>
        </div>
      )}

      <h2>상품 목록</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {data?.products?.map((p: Product) => (
          <li key={p.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <span>
              {p.name} - ₩{p.unitPrice?.toLocaleString('ko-KR')}
            </span>
            <AddToCartButton productId={p.id} />
          </li>
        ))}
      </ul>
    </section>
  );
};
