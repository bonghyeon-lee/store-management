import { Query, Resolver, Args, Mutation } from '@nestjs/graphql';
import { Product } from '../models/product.model';
import { CreateSKUInput, UpdateSKUInput } from '../models/inputs.model';

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

@Resolver(() => Product)
export class ProductResolver {
  @Query(() => Product, { nullable: true, description: 'SKU 조회' })
  sku(@Args('id') id: string): Product | null {
    return products.get(id) || null;
  }

  @Query(() => [Product], { description: 'SKU 목록 조회' })
  skus(
    @Args('category', { nullable: true }) category?: string,
    @Args('isActive', { nullable: true }) isActive?: boolean
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

  @Query(() => [Product], { description: '상품 목록 (기존 호환)' })
  products(): Product[] {
    return Array.from(products.values());
  }

  @Mutation(() => Product, { description: 'SKU 생성' })
  createSKU(@Args('input') input: CreateSKUInput): Product {
    const id = `SKU-${String(products.size + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const product: Product = {
      id,
      name: input.name,
      description: input.description,
      unitPrice: input.unitPrice,
      category: input.category,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    products.set(id, product);
    return product;
  }

  @Mutation(() => Product, { description: 'SKU 정보 수정' })
  updateSKU(
    @Args('id') id: string,
    @Args('input') input: UpdateSKUInput
  ): Product {
    const product = products.get(id);
    if (!product) {
      throw new Error(`SKU를 찾을 수 없습니다: ${id}`);
    }

    const updated: Product = {
      ...product,
      ...(input.name && { name: input.name }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.unitPrice !== undefined && { unitPrice: input.unitPrice }),
      ...(input.category !== undefined && {
        category: input.category,
      }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      updatedAt: new Date().toISOString(),
    };

    products.set(id, updated);
    return updated;
  }

  @Mutation(() => Boolean, { description: 'SKU 삭제/비활성화' })
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
