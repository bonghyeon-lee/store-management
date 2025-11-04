# 백엔드 GraphQL resolver storeId/employeeId ID 타입 수정

## 상태: 📋 TODO

## 문제 상황

프론트엔드의 주요 기능 버튼을 눌렀을 때 요청하는 모든 GraphQL 쿼리/뮤테이션에서 다음과 같은 타입 검증 에러 발생:

``` text
Variable "$storeId" of type "ID" used in position expecting type "String".
Variable "$employeeId" of type "ID" used in position expecting type "String".
```

에러 코드: `GRAPHQL_VALIDATION_FAILED`

**원인**:

- 스키마 파일(`schemas/*.graphql`)에서는 `storeId`, `employeeId` 등을 `ID` 타입으로 정의
- 하지만 백엔드 resolver에서 `string` 타입으로 받아서 NestJS가 자동 생성한 스키마에서는 `String` 타입으로 나타남
- 프론트엔드는 스키마 정의에 따라 `ID` 타입으로 쿼리를 작성하지만, 실제 서버는 `String`을 기대하여 타입 불일치 발생

**영향받는 기능들**:

- 직원 목록 조회 (`GetEmployees`)
- 출퇴근 기록 조회 (`GetAttendance`, `GetAttendanceRecords`)
- 승인 대기 목록 조회 (`GetPendingApprovals`)
- 근태 리포트 조회 (`GetDailyAttendanceReport`, `GetWeeklyAttendanceReport`)
- 근태 승인/거부/수정 요청 (`ApproveAttendance`, `RejectAttendance`, `RequestAttendanceCorrection`)
- 매출 리포트 조회 (`GetDailySales`, `GetWeeklySales`, `GetMonthlySales`, `GetSalesDashboard`)
- 주문 조회/환불 (`GetOrder`, `GetOrders`, `RefundOrder`)
- 재고 조회 (`GetPurchaseOrders`, `GetReorderRecommendations`, `GetInventoryAuditHistory`)

## 원인 분석

**문제점**:

- 스키마 파일(`schemas/*.graphql`)에서는 `storeId`, `employeeId`, `managerId`, `orderId`, `sku` 등을 `ID` 타입으로 정의
- 하지만 백엔드 resolver에서 이들을 `string` 타입으로 선언하여 NestJS GraphQL이 자동 생성한 스키마(`schema.gql`)에서는 `String` 타입으로 나타남
- NestJS GraphQL은 TypeScript의 `string` 타입을 GraphQL의 `String` 스칼라로 매핑하며, `ID` 스칼라를 사용하려면 명시적으로 `GraphQLID` 타입을 지정해야 함

**영향받는 파라미터 타입** (백엔드 resolver에서 수정 필요):

- `storeId: string` → `storeId: GraphQLID` (또는 `@Args('storeId', { type: () => GraphQLID })`)
- `employeeId: string` → `employeeId: GraphQLID`
- `managerId: string` → `managerId: GraphQLID` (GetPendingApprovals)
- `orderId: string` → `orderId: GraphQLID` (GetOrder, RefundOrder)
- `sku: string` → `sku: GraphQLID` (GetPurchaseOrders, GetReorderRecommendations 등)

**수정 방향**:

- 프론트엔드는 그대로 `ID` 타입 사용 (스키마 정의와 일치)
- 백엔드 resolver에서 `GraphQLID` 타입을 사용하도록 수정하여 실제 스키마가 `ID` 타입으로 생성되도록 함

## 해결 방법

백엔드 resolver에서 `GraphQLID` 타입을 사용하도록 수정하여 스키마 정의와 일치시킵니다.

### NestJS GraphQL에서 ID 타입 사용 방법

NestJS GraphQL에서 `ID` 스칼라 타입을 사용하려면 `GraphQLID`를 import하고 명시적으로 타입을 지정해야 합니다:

```typescript
import { GraphQLID } from 'graphql';

@Query(() => [Employee], { description: '직원 목록 조회' })
employees(
  @Args('storeId', { type: () => GraphQLID, nullable: true }) storeId?: string,
  @Args('role', { nullable: true }) role?: string,
  @Args('status', { type: () => EmploymentStatus, nullable: true })
  status?: EmploymentStatus
): Employee[] {
  // storeId는 여전히 TypeScript에서는 string 타입으로 사용 가능
  // GraphQL 스키마에서는 ID 타입으로 생성됨
}
```

**또는** 더 간단한 방법으로:

```typescript
import { ID } from '@nestjs/graphql';

@Query(() => [Employee], { description: '직원 목록 조회' })
employees(
  @Args('storeId', { type: () => ID, nullable: true }) storeId?: string,
  // ...
): Employee[] {
  // ...
}
```

**장점**:

- 스키마 파일(`schemas/*.graphql`)과 실제 생성된 스키마가 일치
- GraphQL 모범 사례에 따라 `ID` 타입 사용
- 프론트엔드 수정 불필요
- 타입 안정성 향상

**주의사항**:

- TypeScript 코드 내에서는 여전히 `string` 타입으로 사용 가능 (ID는 내부적으로 문자열)
- 모든 관련 resolver 파일 수정 필요

## 완료 기준

### 1. 에러 발생 위치 확인

- [ ] 백엔드 스키마 파일 확인 (`schemas/*.graphql`)
  - [ ] `schemas/attendance.graphql` - `ID` 타입 정의 확인
  - [ ] `schemas/sales.graphql` - `ID` 타입 정의 확인
  - [ ] `schemas/inventory.graphql` - `ID` 타입 정의 확인
- [ ] 자동 생성된 스키마 확인 (`backend/*/schema.gql`)
  - [ ] `backend/attendance-service/schema.gql` - 실제 `String` 타입으로 생성됨 확인
  - [ ] `backend/sales-service/schema.gql` - 실제 `String` 타입으로 생성됨 확인
  - [ ] `backend/inventory-service/schema.gql` - 실제 `String` 타입으로 생성됨 확인
- [ ] 백엔드 resolver 파일 확인
  - [ ] 모든 resolver에서 `storeId`, `employeeId`, `managerId`, `orderId`, `sku` 등이 `string` 타입으로 선언되어 있음 확인
- [ ] 실제 GraphQL 서버(Gateway) 스키마 확인 (Introspection 쿼리)

### 2. 타입 불일치 원인 파악

- [ ] NestJS GraphQL이 `string` 타입을 `String` 스칼라로 매핑하는 것 확인
- [ ] `GraphQLID` 또는 `ID` 타입을 사용해야 `ID` 스칼라로 생성되는 것 확인
- [ ] 모든 영향받는 resolver 파라미터 목록 작성
  - [ ] `storeId: string` → `storeId: GraphQLID`
  - [ ] `employeeId: string` → `employeeId: GraphQLID`
  - [ ] `managerId: string` → `managerId: GraphQLID`
  - [ ] `orderId: string` → `orderId: GraphQLID`
  - [ ] `sku: string` → `sku: GraphQLID`

### 3. 수정 작업 수행

#### 3.1 Attendance Service Resolver 수정

- [ ] `backend/attendance-service/src/resolvers/employee.resolver.ts` 수정
  - [ ] `ID` 또는 `GraphQLID` import 추가
  - [ ] `employees` 메서드: `storeId` 파라미터를 `GraphQLID` 타입으로 변경
  - [ ] `employee` 메서드: `id` 파라미터를 `GraphQLID` 타입으로 변경 (필요시)
  - [ ] `updateEmployee` 메서드: `id` 파라미터를 `GraphQLID` 타입으로 변경 (필요시)
  - [ ] `deleteEmployee` 메서드: `id` 파라미터를 `GraphQLID` 타입으로 변경 (필요시)

- [ ] `backend/attendance-service/src/resolvers/attendance.resolver.ts` 수정
  - [ ] `ID` 또는 `GraphQLID` import 추가
  - [ ] `attendance` 메서드: `storeId`, `employeeId` 파라미터를 `GraphQLID` 타입으로 변경
  - [ ] `attendanceRecords` 메서드: `storeId`, `employeeId` 파라미터를 `GraphQLID` 타입으로 변경
  - [ ] `pendingApprovals` 메서드: `storeId`, `managerId` 파라미터를 `GraphQLID` 타입으로 변경
  - [ ] `approveAttendance` 메서드: `storeId`, `employeeId` 파라미터를 `GraphQLID` 타입으로 변경
  - [ ] `rejectAttendance` 메서드: `storeId`, `employeeId` 파라미터를 `GraphQLID` 타입으로 변경
  - [ ] `requestAttendanceCorrection` 메서드: `storeId`, `employeeId` 파라미터를 `GraphQLID` 타입으로 변경

- [ ] `backend/attendance-service/src/resolvers/report.resolver.ts` 수정
  - [ ] `ID` 또는 `GraphQLID` import 추가
  - [ ] `dailyAttendanceReport` 메서드: `storeId` 파라미터를 `GraphQLID` 타입으로 변경
  - [ ] `weeklyAttendanceReport` 메서드: `storeId` 파라미터를 `GraphQLID` 타입으로 변경

#### 3.2 Sales Service Resolver 수정

- [ ] `backend/sales-service/src/resolvers/sales.resolver.ts` 수정
  - [ ] `ID` 또는 `GraphQLID` import 추가
  - [ ] `dailySales` 메서드: `storeId` 파라미터를 `GraphQLID` 타입으로 변경
  - [ ] `weeklySales` 메서드: `storeId` 파라미터를 `GraphQLID` 타입으로 변경
  - [ ] `monthlySales` 메서드: `storeId` 파라미터를 `GraphQLID` 타입으로 변경
  - [ ] `salesDashboard` 메서드: `storeId` 파라미터를 `GraphQLID` 타입으로 변경
  - [ ] `order` 메서드: `storeId`, `orderId` 파라미터를 `GraphQLID` 타입으로 변경
  - [ ] `orders` 메서드: `storeId` 파라미터를 `GraphQLID` 타입으로 변경
  - [ ] `refundOrder` 메서드: `storeId`, `orderId` 파라미터를 `GraphQLID` 타입으로 변경

#### 3.3 Inventory Service Resolver 수정

- [ ] `backend/inventory-service/src/resolvers/inventory.resolver.ts` 수정
  - [ ] `ID` 또는 `GraphQLID` import 추가
  - [ ] `inventoryItem` 메서드: `storeId`, `sku` 파라미터를 `GraphQLID` 타입으로 변경
  - [ ] `storeInventories` 메서드: `storeId`, `sku` 파라미터를 `GraphQLID` 타입으로 변경
  - [ ] `adjustInventory` 메서드: `storeId`, `sku` 파라미터를 `GraphQLID` 타입으로 변경
  - [ ] `reconcileInventory` 메서드: `storeId`, `sku` 파라미터를 `GraphQLID` 타입으로 변경
  - [ ] `inventoryAuditHistory` 메서드: `storeId`, `sku` 파라미터를 `GraphQLID` 타입으로 변경
  - [ ] `reorderRecommendations` 메서드: `storeId`, `sku` 파라미터를 `GraphQLID` 타입으로 변경

- [ ] `backend/inventory-service/src/resolvers/purchase-order.resolver.ts` 수정
  - [ ] `ID` 또는 `GraphQLID` import 추가
  - [ ] `purchaseOrders` 메서드: `storeId`, `sku` 파라미터를 `GraphQLID` 타입으로 변경

#### 3.4 Input 타입 확인 및 수정 (필요시)

- [ ] `CheckInInput`, `CheckOutInput` 등 Input 타입의 `storeId`, `employeeId` 필드 확인
  - [ ] Input 타입은 스키마 파일에서 이미 `ID!`로 정의되어 있으므로 확인만 수행
  - [ ] Input 모델 클래스에서 타입이 올바르게 매핑되는지 확인

### 4. 스키마 재생성 및 검증

- [ ] 각 서비스 재시작하여 스키마 자동 생성
  - [ ] `backend/attendance-service/schema.gql`에서 `ID` 타입으로 생성되었는지 확인
  - [ ] `backend/sales-service/schema.gql`에서 `ID` 타입으로 생성되었는지 확인
  - [ ] `backend/inventory-service/schema.gql`에서 `ID` 타입으로 생성되었는지 확인

### 5. 검증

- [ ] 모든 주요 기능 버튼 클릭 시 에러 없이 동작
  - [ ] 직원 목록 조회
  - [ ] 출퇴근 기록 조회
  - [ ] 승인 대기 목록 조회
  - [ ] 근태 리포트 조회 (일별/주별)
  - [ ] 근태 승인/거부/수정 요청
  - [ ] 매출 리포트 조회 (일별/주별/월별)
  - [ ] 주문 조회/환불
  - [ ] 재고 조회
- [ ] 브라우저 콘솔에 GraphQL 에러 없음
- [ ] 네트워크 탭에서 모든 GraphQL 요청 성공 확인
- [ ] 각 페이지의 기능이 정상 동작

## 조사 방법

### 1. Gateway Introspection 쿼리

Gateway 엔드포인트(`http://localhost:4000/graphql`)에서 다음 쿼리 실행하여 실제 `employees` 쿼리의 파라미터 타입 확인:

```graphql
query IntrospectEmployeesQuery {
  __type(name: "Query") {
    fields {
      name
      args {
        name
        type {
          name
          kind
          ofType {
            name
            kind
          }
        }
      }
    }
  }
}
```

또는 직접 `employees` 필드 확인:

```graphql
query IntrospectEmployees {
  __type(name: "Query") {
    fields(includeDeprecated: true) {
      name
      ... on __Field {
        name
        args {
          name
          type {
            ... on __Type {
              name
              kind
              ofType {
                name
                kind
              }
            }
          }
        }
      }
    }
  }
}
```

### 2. 실제 서비스 스키마 확인

Attendance 서비스의 개별 GraphQL 엔드포인트 확인:

- Attendance Service: `http://localhost:4001/graphql`

## 수정 대상 파일 목록

### 백엔드 Resolver 파일 (5개)

#### Attendance Service (3개 파일)

1. `backend/attendance-service/src/resolvers/employee.resolver.ts`
   - `employees` 메서드: `storeId` 파라미터 (라인 49)
   - `employee` 메서드: `id` 파라미터 (라인 43)
   - `updateEmployee` 메서드: `id` 파라미터 (라인 93)
   - `deleteEmployee` 메서드: `id` 파라미터 (라인 121)

2. `backend/attendance-service/src/resolvers/attendance.resolver.ts`
   - `attendance` 메서드: `storeId`, `employeeId` 파라미터 (라인 33-34)
   - `attendanceRecords` 메서드: `storeId`, `employeeId` 파라미터 (라인 45-46)
   - `pendingApprovals` 메서드: `storeId`, `managerId` 파라미터 (라인 74-75)
   - `approveAttendance` 메서드: `storeId`, `employeeId` 파라미터 (라인 144-145)
   - `rejectAttendance` 메서드: `storeId`, `employeeId` 파라미터 (라인 167-168)
   - `requestAttendanceCorrection` 메서드: `storeId`, `employeeId` 파라미터 (라인 188-189)

3. `backend/attendance-service/src/resolvers/report.resolver.ts`
   - `dailyAttendanceReport` 메서드: `storeId` 파라미터
   - `weeklyAttendanceReport` 메서드: `storeId` 파라미터

#### Sales Service (1개 파일)

1. `backend/sales-service/src/resolvers/sales.resolver.ts`
   - `dailySales` 메서드: `storeId` 파라미터
   - `weeklySales` 메서드: `storeId` 파라미터
   - `monthlySales` 메서드: `storeId` 파라미터
   - `salesDashboard` 메서드: `storeId` 파라미터
   - `order` 메서드: `storeId`, `orderId` 파라미터 (라인 86, 19)
   - `orders` 메서드: `storeId` 파라미터
   - `refundOrder` 메서드: `storeId`, `orderId` 파라미터 (라인 190)

#### Inventory Service (2개 파일)

1. `backend/inventory-service/src/resolvers/inventory.resolver.ts`
   - `inventoryItem` 메서드: `storeId`, `sku` 파라미터 (라인 48, 57)
   - `storeInventories` 메서드: `storeId`, `sku` 파라미터
   - `adjustInventory` 메서드: `storeId`, `sku` 파라미터 (라인 218)
   - `reconcileInventory` 메서드: `storeId`, `sku` 파라미터 (라인 247)
   - `inventoryAuditHistory` 메서드: `storeId`, `sku` 파라미터 (라인 102)
   - `reorderRecommendations` 메서드: `storeId`, `sku` 파라미터 (라인 80)

2. `backend/inventory-service/src/resolvers/purchase-order.resolver.ts`
   - `purchaseOrders` 메서드: `storeId`, `sku` 파라미터 (라인 24)

### 스키마 파일 (참고용, 수정 불필요)

- `schemas/attendance.graphql` - 이미 `ID` 타입으로 정의되어 있음
- `schemas/sales.graphql` - 이미 `ID` 타입으로 정의되어 있음
- `schemas/inventory.graphql` - 이미 `ID` 타입으로 정의되어 있음

### 자동 생성 스키마 파일 (검증용)

- `backend/attendance-service/schema.gql` - 수정 후 `ID` 타입으로 생성되는지 확인
- `backend/sales-service/schema.gql` - 수정 후 `ID` 타입으로 생성되는지 확인
- `backend/inventory-service/schema.gql` - 수정 후 `ID` 타입으로 생성되는지 확인

## 예상되는 추가 문제

### 문제 1: GraphQLID vs ID import

NestJS GraphQL에서는 `GraphQLID` (from 'graphql') 또는 `ID` (from '@nestjs/graphql')를 사용할 수 있습니다.

**권장사항**: `@nestjs/graphql`의 `ID`를 사용하는 것이 더 일관성 있습니다:

```typescript
import { ID } from '@nestjs/graphql';

@Args('storeId', { type: () => ID, nullable: true }) storeId?: string
```

### 문제 2: Input 타입의 ID 필드

`CheckInInput`, `CheckOutInput` 등 Input 타입 내부의 `storeId`, `employeeId` 필드는 스키마에서 이미 `ID!`로 정의되어 있습니다. Input 모델 클래스에서도 올바르게 매핑되어 있는지 확인해야 합니다.

**해결책**:

- Input 모델 클래스 확인 (`backend/*/src/models/inputs.model.ts`)
- `@Field(() => ID)` 데코레이터가 올바르게 사용되고 있는지 확인

### 문제 3: 타입스크립트 타입 vs GraphQL 타입

Resolver 메서드 내부에서는 여전히 TypeScript의 `string` 타입으로 사용할 수 있습니다. `GraphQLID`는 GraphQL 스키마 생성에만 영향을 줍니다.

**예시**:

```typescript
@Args('storeId', { type: () => ID, nullable: true }) storeId?: string
// storeId는 TypeScript에서는 string 타입이지만 GraphQL 스키마에서는 ID 타입으로 생성됨
```

### 문제 4: 스키마 재생성 확인

수정 후 서비스를 재시작해야 스키마 파일(`schema.gql`)이 재생성됩니다.

**해결책**:

- 각 서비스 재시작
- `schema.gql` 파일에서 `String` → `ID`로 변경되었는지 확인
- Gateway에서 통합 스키마가 올바르게 업데이트되었는지 확인

## 우선순위

**Critical**: 프론트엔드의 모든 주요 기능이 동작하지 않아 전체 시스템 사용 불가

**영향 범위**:

- 직원 관리 기능 전체
- 출퇴근 관리 기능 전체
- 매출 리포트 기능 전체
- 주문 관리 기능
- 재고 관리 기능 일부

**사용자 영향**: 모든 주요 기능 버튼 클릭 시 에러 발생으로 시스템 사용 불가

## 참고사항

- GraphQL에서 `ID` 타입은 스칼라 타입으로, 내부적으로는 문자열로 처리되지만 타입 시스템에서 구분됨
- NestJS GraphQL은 `ID` 타입을 자동으로 `string`으로 변환하지만, Gateway나 Federation 레벨에서 타입 검증이 엄격할 수 있음
- 실제 서버가 기대하는 타입을 확인한 후 수정하는 것이 중요
- 모든 변수 타입을 일괄 수정하는 것이 효율적이지만, 각 파일을 개별적으로 검증하는 것이 안전함
- 수정 후에는 반드시 각 기능을 테스트하여 정상 동작 확인 필요

## 작업 순서 추천

1. **1단계**: 현재 상태 확인
   - 자동 생성된 스키마 파일(`schema.gql`)에서 `String` 타입으로 생성된 것 확인
   - 스키마 정의 파일(`schemas/*.graphql`)에서 `ID` 타입으로 정의된 것 확인

2. **2단계**: Attendance Service부터 수정 (가장 많은 쿼리 포함)
   - `ID` 또는 `GraphQLID` import 추가
   - 각 resolver 메서드의 파라미터 타입 수정
   - 서비스 재시작하여 스키마 재생성 확인

3. **3단계**: Sales Service 수정
   - 동일한 방식으로 resolver 수정
   - 서비스 재시작하여 스키마 재생성 확인

4. **4단계**: Inventory Service 수정
   - 동일한 방식으로 resolver 수정
   - 서비스 재시작하여 스키마 재생성 확인

5. **5단계**: Gateway 통합 스키마 확인
   - Gateway에서 Introspection 쿼리로 실제 스키마 확인
   - 모든 `storeId`, `employeeId` 등이 `ID` 타입으로 나타나는지 확인

6. **6단계**: 프론트엔드 테스트
   - 각 주요 기능 버튼 클릭하여 에러 없이 동작하는지 확인
   - 브라우저 콘솔에서 GraphQL 에러 없음 확인
