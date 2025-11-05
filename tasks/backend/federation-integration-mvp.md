---
title: "[Backend] GraphQL Federation 통합 MVP"
owner: backend-team
status: completed
priority: high
due: 2025-11-05
completed: 2025-11-05
related_prompts:
  - ../prompts/graphql-contract-review.md
---

## 목적

SPEC.md의 M0 MVP 스코프에 따라 각 마이크로서비스의 GraphQL Subgraph를 정의하고 Federation으로 통합합니다. 서비스 간 스키마 독립성을 유지하면서 Gateway에서 통합 스키마를 제공합니다.

## 완료 기준

### 1. 각 서비스 Subgraph Schema 정의

- [x] Attendance 서비스 GraphQL Schema 정의
  - ✅ Employee 타입 (`@key(fields: "id")`)
  - ✅ AttendanceRecord 타입 (`@key(fields: "storeId employeeId date")`)
  - ✅ Query/Mutation 정의
  - ✅ Federation 디렉티브 적용
- [x] Inventory 서비스 GraphQL Schema 정의
  - ✅ Product/SKU 타입 (`@key(fields: "id")`)
  - ✅ InventoryItem 타입 (`@key(fields: "storeId sku")`)
  - ✅ PurchaseOrder 타입 (`@key(fields: "id")`)
  - ✅ Query/Mutation 정의
- [x] Sales 서비스 GraphQL Schema 정의
  - ✅ SalesOrder 타입 (`@key(fields: "storeId orderId")`)
  - ✅ Query/Mutation 정의
- [x] Notification 서비스 GraphQL Schema 정의
  - ✅ Notification 타입 (`@key(fields: "id")`)
  - ⚠️ NotificationTemplate 타입 (현재 미구현, 향후 필요시 추가)
  - ✅ Query/Mutation 정의
- [x] Auth 서비스 GraphQL Schema 정의
  - ✅ User 타입 (`@key(fields: "id")`)
  - ⚠️ Role 타입 (UserRole enum으로 구현됨, 별도 타입 불필요)
  - ✅ Query/Mutation 정의

### 2. Federation 스키마 통합

- [x] Gateway에서 Subgraph 스키마 로드
  - ✅ 모든 서비스 (Attendance, Inventory, Sales, Notification, Auth) 연결
  - ✅ IntrospectAndCompose를 통한 자동 스키마 통합
- [x] Federation 스키마 컴파일 및 검증
  - ✅ Gateway 시작 시 자동 검증
  - ✅ 통합 테스트를 통한 검증
- [x] 타입 확장 및 관계 정의
  - ✅ InventoryItem → Product 조인 구현
  - ⚠️ Store 타입 확장 (향후 필요시 구현)
- [x] 스키마 충돌 검사 및 해결
  - ✅ Gateway에서 자동 충돌 검사

### 3. 서비스 간 데이터 조인

- [x] DataLoader 패턴 구현 (N+1 방지)
  - ✅ InventoryItem → Product 조인에 DataLoader 적용
  - ✅ 배치 로딩으로 N+1 문제 해결
- [x] 서비스 간 데이터 조인 로직 구현
  - ✅ InventoryItem에서 Product 정보 조회
  - ⚠️ Employee의 Store 정보 조인 (향후 필요시 구현)
- [x] 캐싱 전략 적용 (기본 구조)
  - ✅ DataLoader 내부 캐싱 활용
  - ⚠️ Redis 캐싱 (M1에서 구현 예정)

### 4. 스키마 버전 관리 및 검증

- [x] 스키마 버전 관리 전략 수립
  - ✅ 스키마 버전 관리 문서 작성 (`docs/backend/schema-versioning.md`)
  - ✅ Breaking Change 정의 및 가이드라인 수립
- [x] Breaking Change 감지 도구 설정
  - ✅ 문서화 완료
  - ⚠️ Apollo Rover CLI 통합 (M1에서 구현 예정)
  - ⚠️ GraphQL Inspector 통합 (M1에서 구현 예정)
- [x] 스키마 레지스트리 기본 구조 (향후 확장)
  - ✅ 전략 문서화 완료
  - ⚠️ Apollo Studio 연동 (M1에서 검토 예정)
- [x] Contract 테스트 자동화 (CI/CD 통합)
  - ✅ GitHub Actions에 Federation 테스트 추가
  - ✅ 통합 테스트 단계에서 자동 실행

### 5. 문서화

- [x] 통합 스키마 문서 생성
  - ✅ `docs/backend/federation-integration.md` - 통합 상태 문서
- [x] 각 서비스 Subgraph 문서
  - ✅ `docs/backend/federation-integration.md`에 각 서비스 Federation 키 정의 포함
- [x] Federation 설계 문서 작성
  - ✅ `docs/backend/federation-integration.md` - 아키텍처 및 설계 문서
- [x] 개발 가이드 작성
  - ✅ `docs/backend/federation-schema-guide.md` - 스키마 개발 가이드
  - ✅ `docs/backend/schema-versioning.md` - 버전 관리 전략

## 산출물

- ✅ 각 서비스 GraphQL Schema 파일
  - 모든 서비스의 `schema.gql` 파일 자동 생성
- ✅ Federation 통합 스키마
  - Gateway에서 자동 통합 및 검증
- ✅ DataLoader 구현 코드
  - `backend/inventory-service/src/resolvers/inventory.resolver.ts`에 구현
- ✅ 스키마 검증 도구 설정
  - GitHub Actions 통합 테스트 단계
  - Contract 테스트 자동화
- ✅ 문서화 파일
  - `docs/backend/federation-integration.md` - 통합 가이드
  - `docs/backend/federation-schema-guide.md` - 개발 가이드
  - `docs/backend/schema-versioning.md` - 버전 관리 전략

## 검증

- [x] Federation 스키마 컴파일 성공 확인
  - ✅ Gateway 시작 시 자동 검증
  - ✅ 통합 테스트 통과
- [ ] Apollo Studio에서 스키마 검증
  - ⚠️ 향후 Apollo Studio 연동 시 검증 예정
- [x] 서비스 간 데이터 조인 테스트
  - ✅ InventoryItem → Product 조인 테스트 통과
  - ✅ 통합 테스트에 포함
- [x] N+1 문제 해결 확인 (성능 테스트)
  - ✅ DataLoader 패턴으로 해결 확인
  - ✅ 통합 테스트에서 검증
- [x] Contract 테스트 실행
  - ✅ `tests/federation-integration.test.ts` 작성 및 실행
  - ✅ GitHub Actions에서 자동 실행
- [x] 코드 리뷰 완료
  - ✅ 모든 변경사항 검토 완료

## 참고사항

- Subscription은 M1에서 구현 예정
- 고급 캐싱 전략은 M1에서 구현 예정
- Schema Registry 도입은 M1에서 검토 예정
- GraphQL Inspector 통합은 M1에서 구현 예정
