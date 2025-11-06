import { Repository, SelectQueryBuilder, ObjectLiteral } from 'typeorm';

/**
 * TypeORM Mock Repository 생성 유틸리티
 * @returns Mock Repository 객체
 */
export function createMockRepository<T extends ObjectLiteral>(): Repository<T> {
  const mockRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  } as unknown as Repository<T>;

  return mockRepository;
}

/**
 * TypeORM QueryBuilder Mock 생성 유틸리티
 * QueryBuilder의 체이닝 패턴을 지원
 */
export function createMockQueryBuilder<T extends ObjectLiteral>(): SelectQueryBuilder<T> {
  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
    getCount: jest.fn(),
    execute: jest.fn(),
  } as unknown as SelectQueryBuilder<T>;

  return mockQueryBuilder;
}

/**
 * Mock Repository에 QueryBuilder 연결
 */
export function setupQueryBuilderMock<T extends ObjectLiteral>(
  repository: Repository<T>,
  queryBuilder: SelectQueryBuilder<T>,
): void {
  (repository.createQueryBuilder as jest.Mock).mockReturnValue(queryBuilder);
}

/**
 * 테스트용 Mock 데이터 생성 헬퍼
 */
export function createMockEntity<T extends ObjectLiteral>(
  entityClass: new () => T,
  overrides?: Partial<T>,
): T {
  const entity = new entityClass();
  if (overrides) {
    Object.assign(entity, overrides);
  }
  return entity;
}
