import { Query, Resolver, Args, Mutation } from '@nestjs/graphql';

interface Product {
  id: string;
  name: string;
  description?: string | null;
  unitPrice: number;
  category?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 인메모리 데이터 저장소 (MVP 단계)
const products: Map<string, Product> = new Map();

// 초기 샘플 데이터
const initializeSampleData = () => {
  const now = new Date().toISOString();
  products.set('SKU-001', {
    id: 'SKU-001',
    name: '샘플 상품 1',
    description: '테스트용 상품 1',
    unitPrice: 10000,
    category: '일반',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });
  products.set('SKU-002', {
    id: 'SKU-002',
    name: '샘플 상품 2',
    description: '테스트용 상품 2',
    unitPrice: 25000,
    category: '일반',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });
  products.set('SKU-003', {
    id: 'SKU-003',
    name: '샘플 상품 3',
    description: '테스트용 상품 3',
    unitPrice: 39900,
    category: '특가',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });
};

initializeSampleData();

@Resolver('Product')
export class ProductResolver {
  @Query('sku')
  sku(@Args('id') id: string): Product | null {
    return products.get(id) || null;
  }

  @Query('skus')
  skus(
    @Args('category') category?: string,
    @Args('isActive') isActive?: boolean
  ): Product[] {
    let result = Array.from(products.values());

    if (category) {
      result = result.filter((p) => p.category === category);
    }

    if (isActive !== undefined) {
      result = result.filter((p) => p.isActive === isActive);
    }

    return result;
  }

  @Query('products')
  products(): Product[] {
    return Array.from(products.values());
  }

  @Mutation('createSKU')
  createSKU(
    @Args('input')
    input: {
      name: string;
      description?: string;
      unitPrice: number;
      category?: string;
    }
  ): Product {
    const id = `SKU-${String(products.size + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const product: Product = {
      id,
      name: input.name,
      description: input.description || null,
      unitPrice: input.unitPrice,
      category: input.category || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    products.set(id, product);
    return product;
  }

  @Mutation('updateSKU')
  updateSKU(
    @Args('id') id: string,
    @Args('input')
    input: {
      name?: string;
      description?: string;
      unitPrice?: number;
      category?: string;
      isActive?: boolean;
    }
  ): Product {
    const product = products.get(id);
    if (!product) {
      throw new Error(`SKU를 찾을 수 없습니다: ${id}`);
    }

    const updated: Product = {
      ...product,
      ...(input.name && { name: input.name }),
      ...(input.description !== undefined && {
        description: input.description || null,
      }),
      ...(input.unitPrice !== undefined && { unitPrice: input.unitPrice }),
      ...(input.category !== undefined && {
        category: input.category || null,
      }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      updatedAt: new Date().toISOString(),
    };

    products.set(id, updated);
    return updated;
  }

  @Mutation('deleteSKU')
  deleteSKU(@Args('id') id: string): boolean {
    const product = products.get(id);
    if (!product) {
      return false;
    }

    // 실제 삭제 대신 비활성화
    product.isActive = false;
    product.updatedAt = new Date().toISOString();
    products.set(id, product);
    return true;
  }
}
