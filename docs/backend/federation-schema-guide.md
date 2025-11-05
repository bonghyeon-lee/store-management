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

### @requires 디렉티브

`@requires` 디렉티브는 다른 서비스의 필드를 참조하여 현재 서비스의 필드를 계산할 때 사용합니다. 이는 **필드 레벨 권한**이나 **계산된 필드**를 구현할 때 유용합니다.

**사용 시나리오:**
- 다른 서비스의 데이터를 기반으로 필드를 계산해야 할 때
- 필드 레벨 권한 검증을 위해 다른 서비스의 데이터가 필요할 때

**예시: InventoryItem에서 Product 정보를 기반으로 총 가치 계산**

```typescript
// inventory.graphql
type InventoryItem @key(fields: "storeId sku") {
  storeId: ID!
  sku: ID!
  quantityOnHand: Int!
  # Product 서비스의 unitPrice를 참조하여 계산
  totalValue: Float! @requires(fields: "sku { unitPrice }")
}

# Product는 외부 타입으로 선언
extend type Product @key(fields: "id") {
  id: ID! @external
  unitPrice: Float! @external
}
```

**주의사항:**
- `@requires`를 사용하면 해당 필드가 항상 다른 서비스에 의존하게 됩니다
- 성능에 영향을 줄 수 있으므로 신중하게 사용해야 합니다
- 가능하면 DataLoader 패턴을 사용한 ResolveField로 대체하는 것을 권장합니다

### @provides 디렉티브

`@provides` 디렉티브는 다른 서비스에서 정의한 타입의 필드를 현재 서비스에서 제공할 때 사용합니다. 주로 **Entity Reference**를 반환할 때 사용됩니다.

**사용 시나리오:**
- Query나 Mutation에서 다른 서비스의 Entity를 반환할 때
- 다른 서비스의 필드를 포함하여 반환해야 할 때

**예시: Order에서 Product 정보를 함께 반환**

```typescript
// sales.graphql
type Order @key(fields: "storeId orderId") {
  storeId: ID!
  orderId: ID!
  lineItems: [LineItem!]!
}

type LineItem {
  sku: ID!
  quantity: Int!
  # Product 서비스의 필드를 제공
  product: Product! @provides(fields: "id name unitPrice")
}

# Product는 외부 타입으로 선언
extend type Product @key(fields: "id") {
  id: ID! @external
  name: String! @external
  unitPrice: Float! @external
}
```

**주의사항:**
- `@provides`로 제공하는 필드는 반드시 `@external`로 선언되어야 합니다
- 제공하는 필드는 해당 서비스에서 실제로 조회 가능해야 합니다
- 불필요한 필드를 제공하면 성능에 영향을 줄 수 있습니다

### @external 디렉티브

`@external` 디렉티브는 다른 서비스에서 정의한 필드를 현재 서비스에서 참조할 때 사용합니다. `@requires`나 `@provides`와 함께 사용됩니다.

**사용 규칙:**
- `@requires`나 `@provides`를 사용할 때는 반드시 `@external`을 함께 사용해야 합니다
- `@external` 필드는 실제로 현재 서비스에 저장되지 않습니다
- 다른 서비스에서 제공하는 데이터를 참조하기 위한 선언입니다

**예시:**

```typescript
// 다른 서비스의 타입을 확장
extend type Product @key(fields: "id") {
  id: ID! @external
  unitPrice: Float! @external
  # 현재 서비스에서 추가하는 필드
  inventoryStatus: InventoryStatus!
}
```

### Federation 디렉티브 사용 전략

#### 1. 기본 원칙

- **가능하면 `@key`와 DataLoader 패턴 사용**: `@requires`나 `@provides`보다는 ResolveField와 DataLoader를 사용하는 것이 성능상 유리합니다
- **필요할 때만 사용**: `@requires`와 `@provides`는 성능에 영향을 줄 수 있으므로 신중하게 사용해야 합니다
- **명확한 의존성 관리**: 서비스 간 의존성을 명확히 문서화하고 관리해야 합니다

#### 2. 사용 가이드라인

**`@key` 사용:**
- ✅ 모든 Entity 타입에 필수
- ✅ 서비스 간 참조가 필요한 타입에 필수
- ✅ 복합 키 사용 가능 (예: `@key(fields: "storeId employeeId date")`)

**`@requires` 사용:**
- ✅ 필드 레벨 권한 검증이 필요할 때
- ✅ 계산된 필드가 다른 서비스 데이터에 의존할 때
- ❌ 단순 조회는 DataLoader 패턴 사용 권장

**`@provides` 사용:**
- ✅ Query/Mutation에서 다른 서비스 Entity를 반환할 때
- ✅ 성능 최적화를 위해 필요한 필드를 미리 제공할 때
- ❌ 모든 필드를 제공할 필요는 없음 (필요한 필드만)

**`@external` 사용:**
- ✅ `@requires`나 `@provides`와 함께 필수
- ✅ 다른 서비스의 타입을 확장할 때

#### 3. 현재 프로젝트 적용 계획

**현재 상태:**
- 모든 주요 Entity에 `@key` 디렉티브 적용 완료
- DataLoader 패턴으로 서비스 간 조인 구현 (InventoryItem → Product)

**향후 적용 예정:**
- `@requires`: 필드 레벨 권한 검증이 필요한 경우
- `@provides`: Order에서 Product 정보를 함께 반환하는 경우
- `@extends`: Store 서비스가 별도로 구현되면 Employee나 Order에서 Store 정보 확장

#### 4. 성능 고려사항

- **`@requires` 사용 시**: 항상 다른 서비스에 추가 쿼리가 발생하므로 성능에 영향을 줄 수 있습니다
- **`@provides` 사용 시**: 필요한 필드만 제공하여 불필요한 데이터 전송을 방지합니다
- **DataLoader 패턴**: 배치 로딩을 통해 N+1 문제를 해결하고 성능을 최적화합니다

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
