import { Query, Resolver, Args, Mutation, ID } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../models/product.model';
import { CreateSKUInput, UpdateSKUInput } from '../models/inputs.model';
import { ProductEntity } from '../entities/product.entity';

@Resolver(() => Product)
export class ProductResolver {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>
  ) {}

  @Query(() => Product, { nullable: true, description: 'SKU 조회' })
  async sku(@Args('id', { type: () => ID }) id: string): Promise<Product | null> {
    const entity = await this.productRepository.findOne({ where: { id } });
    if (!entity) return null;
    return this.mapEntityToModel(entity);
  }

  @Query(() => [Product], { description: 'SKU 목록 조회' })
  async skus(
    @Args('category', { nullable: true }) category?: string,
    @Args('isActive', { nullable: true }) isActive?: boolean
  ): Promise<Product[]> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive });
    }

    const entities = await queryBuilder.getMany();
    return entities.map((entity) => this.mapEntityToModel(entity));
  }

  @Query(() => [Product], { description: '상품 목록 (기존 호환)' })
  async products(): Promise<Product[]> {
    const entities = await this.productRepository.find();
    return entities.map((entity) => this.mapEntityToModel(entity));
  }

  @Mutation(() => Product, { description: 'SKU 생성' })
  async createSKU(@Args('input') input: CreateSKUInput): Promise<Product> {
    // 입력 값 검증
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('상품명은 필수 입력 항목입니다.');
    }

    if (input.unitPrice === undefined || input.unitPrice < 0) {
      throw new Error('단가는 0 이상이어야 합니다.');
    }

    // ID 생성 (기존 로직 유지)
    const count = await this.productRepository.count();
    const id = `SKU-${String(count + 1).padStart(3, '0')}`;

    const entity = this.productRepository.create({
      id,
      name: input.name.trim(),
      description: input.description?.trim(),
      unitPrice: input.unitPrice,
      category: input.category?.trim(),
      isActive: true,
    });

    const saved = await this.productRepository.save(entity);
    return this.mapEntityToModel(saved);
  }

  @Mutation(() => Product, { description: 'SKU 정보 수정' })
  async updateSKU(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateSKUInput
  ): Promise<Product> {
    const entity = await this.productRepository.findOne({ where: { id } });
    if (!entity) {
      throw new Error(`SKU를 찾을 수 없습니다: ${id}`);
    }

    // 입력 값 검증
    if (input.name !== undefined && input.name.trim().length === 0) {
      throw new Error('상품명은 비어있을 수 없습니다.');
    }

    if (input.unitPrice !== undefined && input.unitPrice < 0) {
      throw new Error('단가는 0 이상이어야 합니다.');
    }

    // 업데이트
    if (input.name !== undefined) entity.name = input.name.trim();
    if (input.description !== undefined) entity.description = input.description?.trim();
    if (input.unitPrice !== undefined) entity.unitPrice = input.unitPrice;
    if (input.category !== undefined) entity.category = input.category?.trim();
    if (input.isActive !== undefined) entity.isActive = input.isActive;

    const updated = await this.productRepository.save(entity);
    return this.mapEntityToModel(updated);
  }

  @Mutation(() => Boolean, { description: 'SKU 삭제/비활성화' })
  async deleteSKU(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    const entity = await this.productRepository.findOne({ where: { id } });
    if (!entity) {
      return false;
    }

    // 실제 삭제 대신 비활성화
    entity.isActive = false;
    await this.productRepository.save(entity);
    return true;
  }

  // 엔티티를 GraphQL 모델로 변환
  private mapEntityToModel(entity: ProductEntity): Product {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      unitPrice: Number(entity.unitPrice),
      category: entity.category,
      isActive: entity.isActive,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
