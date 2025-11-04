import { Button } from '@shared/ui/Button';
import React from 'react';

type Props = { productId: string };

export const AddToCartButton: React.FC<Props> = ({ productId }) => {
  const handleClick = () => {
    // 예시 동작
    window.alert(`장바구니에 담았습니다: ${productId}`);
  };

  return <Button onClick={handleClick}>장바구니</Button>;
};


