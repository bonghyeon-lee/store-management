import React from 'react';
import { useQuery } from '@apollo/client';
import { graphql } from '@shared/api/generated/gql';
import { Button } from '@shared/ui/Button';
import { AddToCartButton } from '@features/add-to-cart/ui/AddToCartButton';
import type { Product } from '@entities/product/model/types';

const ProductsQuery = graphql(/* GraphQL */ `
  query Products {
    products {
      id
      name
      price
    }
  }
`);

export const HomePage: React.FC = () => {
  const { data, loading, error } = useQuery<{ products: Product[] }>(ProductsQuery);

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>에러: {error.message}</p>;

  return (
    <section>
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
      <Button onClick={() => window.alert('ok')}>더 보기</Button>
    </section>
  );
};
