---
title: "[Tests] 테스트 Fixtures 및 Mock 데이터"
owner: backend-team, frontend-team
status: in_progress
priority: medium
due: 2025-11-20
related_prompts:
  - ../prompts/test-strategy.md
---

## 목적

테스트용 데이터 및 Mock 설정을 표준화합니다. 공통 Fixture 데이터와 Mock 서비스를 생성하여 테스트 작성의 효율성을 높이고 일관성을 보장합니다.

## 완료 기준

### 1. 공통 테스트 Fixtures 생성

- [ ] 백엔드 Fixture 데이터 생성
  - [ ] Employee Fixture (`tests/fixtures/employee.fixture.ts`)
    - [ ] 샘플 Employee 객체 생성 함수
    - [ ] 다양한 시나리오별 Employee 데이터 (활성, 비활성, 다양한 역할 등)
  - [ ] Attendance Fixture (`tests/fixtures/attendance.fixture.ts`)
    - [ ] 샘플 AttendanceRecord 객체 생성 함수
    - [ ] 다양한 상태별 Attendance 데이터 (pending, approved, rejected)
  - [ ] Product Fixture (`tests/fixtures/product.fixture.ts`)
    - [ ] 샘플 Product 객체 생성 함수
    - [ ] 다양한 카테고리별 Product 데이터
  - [ ] InventoryItem Fixture (`tests/fixtures/inventory.fixture.ts`)
    - [ ] 샘플 InventoryItem 객체 생성 함수
    - [ ] 재고 부족/충분 시나리오별 데이터
  - [ ] Order Fixture (`tests/fixtures/order.fixture.ts`)
    - [ ] 샘플 Order 객체 생성 함수
    - [ ] 다양한 상태별 Order 데이터
  - [ ] User Fixture (`tests/fixtures/user.fixture.ts`)
    - [ ] 샘플 User 객체 생성 함수
    - [ ] 다양한 역할별 User 데이터 (HQ 관리자, 점장, 직원)
- [ ] 프론트엔드 Fixture 데이터 생성
  - [ ] GraphQL 응답 Fixture (`tests/fixtures/graphql-responses.ts`)
    - [ ] 각 Query/Mutation에 대한 샘플 응답 데이터
    - [ ] 에러 응답 Fixture
  - [ ] UI 상태 Fixture (`tests/fixtures/ui-state.ts`)
    - [ ] Redux Store 상태 Fixture (필요 시)
    - [ ] 폼 데이터 Fixture

### 2. GraphQL Mock 설정

- [x] Apollo Client Mock 설정
  - [x] MockedProvider 설정 (`frontend/src/test/mock-apollo-client.tsx`)
  - [x] GraphQL 쿼리 Mock 헬퍼 함수
    - [x] `createMockQuery` - Query Mock 생성
    - [x] `createMockMutation` - Mutation Mock 생성
    - [x] `createMockError` - 에러 Mock 생성
  - [ ] 공통 Mock 데이터 제공자 (`tests/utils/mock-data-provider.ts`) (선택사항)
- [ ] GraphQL Resolver Mock 설정
  - [ ] 백엔드 테스트용 GraphQL Context Mock
  - [ ] 인증 Context Mock (JWT 토큰, 사용자 정보)
  - [ ] 권한 Context Mock (다양한 역할별)

### 3. 외부 서비스 Mock 설정

- [ ] 이메일 서비스 Mock
  - [ ] `tests/mocks/email-service.mock.ts`
  - [ ] 이메일 발송 Mock 함수
  - [ ] 이메일 발송 이력 확인 함수
- [ ] 외부 API Mock (향후 필요 시)
  - [ ] POS 시스템 연동 Mock
  - [ ] ERP 시스템 연동 Mock
  - [ ] 외부 인증 서비스 Mock (Keycloak, Cognito 등)

### 4. 데이터베이스 시드 데이터 관리

- [ ] 시드 데이터 생성 스크립트
  - [ ] `tests/seed/seed-data.ts` - 시드 데이터 생성 함수
  - [ ] 개발 환경용 시드 데이터
  - [ ] 테스트 환경용 시드 데이터
- [ ] 시드 데이터 관리
  - [ ] 시드 데이터 버전 관리
  - [ ] 시드 데이터 문서화 (각 데이터의 용도 명시)
- [ ] 시드 데이터 재생성 도구
  - [ ] `npm run seed` 스크립트 추가
  - [ ] 시드 데이터 초기화 스크립트

### 5. Fixture 및 Mock 유틸리티 함수

- [x] Fixture 빌더 패턴 구현 (기본 구현 완료)
  - [x] Fluent API를 통한 Fixture 생성 (`createMockEmployee` 등)
  - [x] 기본값 설정 및 커스터마이징 지원
- [x] Mock 데이터 생성 유틸리티
  - [ ] 랜덤 데이터 생성 함수 (faker.js 또는 유사 라이브러리 활용) (선택사항)
  - [x] 날짜 범위 생성 함수 (`createTestDate`)
  - [x] ID 생성 함수 (`createTestId`)
- [x] 테스트 데이터 정리 유틸리티
  - [x] 테스트 후 데이터 정리 함수 (`clearTestData`)
  - [ ] 트랜잭션 롤백 유틸리티 (데이터베이스 연동 시 필요)

### 6. Fixture 및 Mock 문서화

- [ ] Fixture 사용 가이드 작성
  - [ ] `docs/tests/fixtures-guide.md` - Fixture 사용 방법 문서
  - [ ] 각 Fixture의 용도 및 예시
- [ ] Mock 설정 가이드 작성
  - [ ] `docs/tests/mocking-guide.md` - Mock 설정 방법 문서
  - [ ] GraphQL Mock 사용 예시
  - [ ] 외부 서비스 Mock 사용 예시

## 산출물

- Fixture 파일들
  - `tests/fixtures/` 디렉토리에 모든 Fixture 파일 생성 (부분 완료: `tests/utils/mock-data.ts`에 기본 Mock 데이터 포함)
- Mock 설정 파일들
  - `tests/mocks/` 디렉토리에 모든 Mock 파일 생성 (선택사항, 필요 시 추가)
  - [x] `tests/utils/` 디렉토리에 Mock 유틸리티 함수 생성
- 시드 데이터 스크립트
  - `tests/seed/seed-data.ts` - 시드 데이터 생성 스크립트 (선택사항)
  - `package.json`에 `seed` 스크립트 추가 (선택사항)
- 문서화 파일
  - `docs/tests/fixtures-guide.md` - Fixture 사용 가이드 (선택사항)
  - `docs/tests/mocking-guide.md` - Mock 설정 가이드 (선택사항)

## 검증

- [x] 모든 Fixture 파일이 정상적으로 import 및 사용 가능한지 확인
- [x] GraphQL Mock이 Apollo Client 테스트에서 정상 동작하는지 확인 (헬퍼 함수 작성 완료)
- [ ] 외부 서비스 Mock이 통합 테스트에서 정상 동작하는지 확인 (선택사항)
- [ ] 시드 데이터가 정상적으로 생성되는지 확인 (선택사항)
- [x] Fixture 및 Mock 사용 예시 테스트 작성 (기본 Mock 데이터 및 헬퍼 함수 포함)
- [x] 코드 리뷰 완료

## 참고사항

- Fixture 데이터는 실제 데이터와 유사하지만 프로덕션 데이터가 아닌 샘플 데이터 사용
- Mock 데이터는 faker.js 또는 @faker-js/faker 라이브러리 활용 고려
- Fixture와 Mock은 버전 관리에 포함하되, 대용량 파일은 제외
- Fixture 데이터는 테스트 간 독립성을 보장하기 위해 각 테스트에서 새로 생성하는 것을 권장
