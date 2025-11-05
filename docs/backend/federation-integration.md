# Federation 통합 가이드

## 개요

이 문서는 Apollo Federation을 사용한 마이크로서비스 아키텍처에서 Gateway와 Subgraph 서비스 간의 통합 상태를 설명합니다.

## 아키텍처

```
┌─────────────────┐
│  Gateway (4000) │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────────┬─────────────┐
    │         │          │              │             │
┌───▼───┐ ┌──▼───┐ ┌───▼───┐ ┌─────────▼──┐ ┌───────▼────┐
│Attend.│ │Invent│ │ Sales │ │Notification│ │   Auth   │
│ (4001)│ │(4002)│ │ (4003)│ │   (4004)   │ │  (4005)  │
└───────┘ └──────┘ └───────┘ └────────────┘ └──────────┘
```

## Federation 키 전략

각 서비스의 Federation 키 정의:

### Attendance 서비스

- **Employee**: `@key(fields: "id")`
- **Attendance**: `@key(fields: "storeId employeeId date")`

### Inventory 서비스

- **Product**: `@key(fields: "id")`
- **InventoryItem**: `@key(fields: "storeId sku")`

### Sales 서비스

- **Order**: `@key(fields: "storeId orderId")`

### Auth 서비스

- **User**: `@key(fields: "id")`

### Notification 서비스

- **Notification**: `@key(fields: "id")`

## 서비스 간 데이터 조인

### 구현된 조인

#### 1. InventoryItem → Product

- **위치**: `inventory-service/src/resolvers/inventory.resolver.ts`
- **구현 방식**: DataLoader를 사용한 배치 로딩
- **사용 예시**:

```graphql
query {
  storeInventories(storeId: "STORE-001") {
    sku
    quantityOnHand
    product {
      id
      name
      unitPrice
      category
    }
  }
}
```

### 향후 구현 예정 조인

#### 2. Employee → Store (예정)

- Store 서비스가 별도로 구현되면 추가 예정

#### 3. Order → Employee (예정)

- Order에서 처리한 직원 정보 조회

## DataLoader 패턴

### 구현 상태

현재 `inventory-service`에서 Product 조회를 위한 DataLoader가 구현되어 있습니다.

### 구현 위치

- `backend/inventory-service/src/resolvers/inventory.resolver.ts`

### 사용 예시

```typescript
// DataLoader 생성
const createProductLoader = (): DataLoader<string, Product | null> => {
  return new DataLoader<string, Product | null>(async (productIds: string[]) => {
    // 배치로 Product 조회
    return productIds.map((id) => products.get(id) || null);
  });
};

// Resolver에서 사용
@ResolveField(() => Product, { nullable: true })
async product(@Parent() inventoryItem: InventoryItem): Promise<Product | null> {
  if (!inventoryItem.sku) {
    return null;
  }
  return this.productLoader.load(inventoryItem.sku);
}
```

### 베스트 프랙티스

1. **컨텍스트 기반 초기화**: DataLoader는 요청 컨텍스트에서 생성되어야 합니다 (현재는 생성자에서 초기화하지만, 향후 개선 필요)
2. **배치 크기 제한**: 대량의 데이터를 처리할 때는 배치 크기를 제한해야 합니다
3. **캐싱 전략**: DataLoader는 기본적으로 요청 범위 내에서 캐싱됩니다

## 스키마 통합 검증

### Gateway 스키마 확인

Gateway를 통해 통합 스키마를 조회할 수 있습니다:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { types { name } } }"}'
```

### Apollo Studio 연동 (선택사항)

Apollo Studio를 사용하여 스키마를 시각화하고 검증할 수 있습니다:

1. Apollo Studio 계정 생성
2. Gateway URL 설정
3. 스키마 자동 동기화

## 문제 해결

### 스키마 충돌

스키마 충돌이 발생하면:

1. Gateway 로그 확인
2. 각 서비스의 스키마 파일(`schema.gql`) 확인
3. 중복된 타입 정의 확인
4. Federation 디렉티브 확인

### 서비스 간 조인 실패

1. **네트워크 연결 확인**: Gateway가 모든 서비스에 접근 가능한지 확인
2. **키 필드 확인**: Federation 키가 올바르게 정의되었는지 확인
3. **Resolver 확인**: ResolveField가 올바르게 구현되었는지 확인

### N+1 문제

DataLoader가 제대로 작동하는지 확인:

1. 네트워크 요청 횟수 측정
2. 배치 로딩 로직 확인
3. 캐싱 동작 확인

## 성능 최적화

### 현재 상태

- ✅ DataLoader 패턴 구현 (InventoryItem → Product)
- ⏳ 요청 컨텍스트 기반 DataLoader 초기화 (개선 필요)
- ⏳ 고급 캐싱 전략 (Redis 등, 향후 구현 예정)

### 향후 개선 사항

1. **Redis 캐싱**: 자주 조회되는 데이터에 대한 Redis 캐싱
2. **Connection Pooling**: 데이터베이스 연결 풀 최적화
3. **Query 복잡도 분석**: Apollo Server의 query complexity 분석 활성화

## 테스트

### 통합 테스트 실행

```bash
# 모든 서비스 시작
docker-compose up -d

# 테스트 실행
npm run test:federation
```

### 수동 테스트

기본 쿼리 테스트:

```graphql
query {
  employees {
    id
    name
  }
  storeInventories(storeId: "STORE-001") {
    sku
    product {
      id
      name
    }
  }
}
```

## 참고 자료

- [Apollo Federation 문서](https://www.apollographql.com/docs/federation/)
- [DataLoader 패턴](https://github.com/graphql/dataloader)
- [NestJS GraphQL Federation](https://docs.nestjs.com/graphql/federation)
