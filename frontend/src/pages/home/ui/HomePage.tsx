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
      price
    }
  }
`;

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { data, loading, error } = useQuery<{ products: Product[] }>(ProductsQuery);

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
          </div>
        </div>
      )}

      <h2>상품 목록</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {data?.products?.map((p: Product) => (
          <li key={p.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <span>
              {p.name} - {p.price?.toLocaleString()}원
            </span>
            <AddToCartButton productId={p.id} />
          </li>
        ))}
      </ul>
    </section>
  );
};
