# Federation 스키마 개발 가이드

## 개요

이 문서는 GraphQL Federation을 사용한 마이크로서비스 아키텍처에서 스키마를 정의하고 관리하는 방법을 설명합니다.

## 스키마 정의 방식

이 프로젝트는 **GraphQL Code First** 방식을 사용합니다. TypeScript 데코레이터를 사용하여 스키마를 정의하고, NestJS가 자동으로 GraphQL 스키마 파일을 생성합니다.

## Federation 디렉티브 사용법

### @key 디렉티브

각 엔티티는 Federation에서 참조 가능하도록 `@key` 디렉티브를 추가해야 합니다.

```typescript
import { ObjectType, Field, ID, Directive } from '@nestjs/graphql';

@ObjectType({ description: '직원' })
@Directive('@key(fields: "id")')
export class Employee {
  @Field(() => ID)
  id!: string;

  // ... 다른 필드들
}
```

### 복합 키 사용

여러 필드를 조합한 복합 키도 사용할 수 있습니다:

```typescript
@ObjectType({ description: '출퇴근 기록' })
@Directive('@key(fields: "storeId employeeId date")')
export class Attendance {
  @Field(() => ID)
  storeId!: string;

  @Field(() => ID)
  employeeId!: string;

  @Field()
  date!: string;

  // ... 다른 필드들
}
```

### @extends 디렉티브 (향후)

다른 서비스에서 정의한 타입을 확장하려면 `@extends` 디렉티브를 사용합니다:

```typescript
@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "id")')
export class Store {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;
}
```

## 서비스별 스키마 정의

### Attendance 서비스

**Federation 키:**

- `Employee`: `@key(fields: "id")`
- `Attendance`: `@key(fields: "storeId employeeId date")`

**주요 타입:**

- `Employee` - 직원 정보
- `Attendance` - 출퇴근 기록
- `AttendanceReport` - 근태 리포트

### Inventory 서비스

**Federation 키:**

- `Product`: `@key(fields: "id")`
- `InventoryItem`: `@key(fields: "storeId sku")`
- `PurchaseOrder`: `@key(fields: "id")`

**주요 타입:**

- `Product` - 상품 정보
- `InventoryItem` - 재고 항목
- `PurchaseOrder` - 발주
- `ReorderRecommendation` - 리오더 추천

### Sales 서비스

**Federation 키:**

- `Order`: `@key(fields: "storeId orderId")`

**주요 타입:**

- `Order` - 주문
- `LineItem` - 주문 항목
- `DailySales`, `WeeklySales`, `MonthlySales` - 매출 리포트

### Auth 서비스

**Federation 키:**

- `User`: `@key(fields: "id")`

**주요 타입:**

- `User` - 사용자 정보
- `AuthToken` - 인증 토큰

### Notification 서비스

**Federation 키:**

- `Notification`: `@key(fields: "id")`

**주요 타입:**

- `Notification` - 알림

## 서비스 간 데이터 조인

### DataLoader 패턴

서비스 간 데이터 조인 시 N+1 문제를 방지하기 위해 DataLoader 패턴을 사용합니다.

**예시: InventoryItem → Product 조인**

```typescript
// inventory.resolver.ts
import DataLoader from 'dataloader';

// DataLoader 생성 함수
function createProductLoader() {
  return new DataLoader<string, Product | null>(async (productIds) => {
    // 배치로 Product 조회
    const products = await fetchProductsByIds(productIds);
    return productIds.map((id) => products.find((p) => p.id === id) || null);
  });
}

// Resolver에서 사용
@ResolveField(() => Product, { nullable: true })
async product(@Parent() inventoryItem: InventoryItem): Promise<Product | null> {
  return this.productLoader.load(inventoryItem.sku);
}
```

## 스키마 생성 및 검증

### 스키마 자동 생성

각 서비스는 `autoSchemaFile` 옵션으로 스키마 파일을 자동 생성합니다:

```typescript
// app.module.ts
GraphQLModule.forRoot({
  driver: ApolloFederationDriver,
  autoSchemaFile: {
    path: 'schema.gql',
    federation: { version: 2 },
  },
}),
```

생성된 스키마 파일은 `backend/{service}/schema.gql`에 위치합니다.

### 스키마 검증

Gateway는 서비스 시작 시 모든 Subgraph의 스키마를 자동으로 검증합니다:

1. 각 Subgraph URL에서 스키마 Introspection
2. Federation 스키마 컴파일
3. 타입 충돌 검사
4. 통합 스키마 생성

## 스키마 버전 관리

### 네이밍 규칙

- **Breaking Change**: 타입 이름 변경, 필드 제거, 필수 필드 추가
- **Non-Breaking Change**: 필드 추가, 선택적 필드 추가, 타입 확장

### 버전 관리 전략

1. **스키마 변경 시 Contract 테스트 업데이트 필수**
2. **Breaking Change는 반드시 문서화**
3. **스키마 변경은 PR 단위로 검토**

## 개발 워크플로우

### 1. 새로운 타입 추가

1. `src/models/` 디렉터리에 TypeScript 모델 파일 생성
2. `@ObjectType()` 및 `@Directive('@key(...)')` 추가
3. Resolver에서 Query/Mutation 구현
4. 서비스 재시작 후 `schema.gql` 자동 생성 확인

### 2. 기존 타입 수정

1. 모델 파일 수정
2. Breaking Change 여부 확인
3. Contract 테스트 업데이트
4. Gateway에서 통합 스키마 검증

### 3. 서비스 간 조인 추가

1. DataLoader 생성 함수 구현
2. Resolver에 `@ResolveField()` 추가
3. 통합 테스트 작성
4. 성능 테스트 수행 (N+1 문제 확인)

## 주의사항

1. **Federation 키는 변경하지 않음**: Federation 키는 타입의 고유 식별자이므로 변경하면 다른 서비스와의 조인이 실패할 수 있습니다.

2. **순환 의존성 방지**: 서비스 간 순환 참조를 피해야 합니다. 예를 들어, A 서비스가 B를 참조하고 B가 A를 참조하는 것은 피해야 합니다.

3. **타입 이름 충돌**: 다른 서비스와 동일한 타입 이름을 사용하지 않도록 주의합니다.

4. **필드 nullability**: 필드를 추가할 때는 `nullable: true`를 기본으로 하고, 필요시에만 필수 필드로 설정합니다.

## 참고 자료

- [Apollo Federation 문서](https://www.apollographql.com/docs/federation/)
- [NestJS GraphQL 문서](https://docs.nestjs.com/graphql/quick-start)
- [DataLoader 패턴](https://github.com/graphql/dataloader)
