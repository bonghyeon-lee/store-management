import { Query, Resolver } from '@nestjs/graphql';

interface Product {
  id: string;
  name: string;
  price: number;
}

@Resolver('Product')
export class ProductResolver {
  @Query('products')
  products(): Product[] {
    return [
      { id: 'P-001', name: '샘플 상품 1', price: 10000 },
      { id: 'P-002', name: '샘플 상품 2', price: 25000 },
      { id: 'P-003', name: '샘플 상품 3', price: 39900 },
    ];
  }
}


