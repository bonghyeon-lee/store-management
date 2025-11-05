---
title: "[Frontend] Apollo Client Setup & UI Contract"
owner: frontend-engineer
status: completed
priority: high
completed_date: 2025-01-27
related_prompts:
  - ../../prompts/frontend-wireframes.md
  - ../../prompts/graphql-contract-review.md
---

## 목적

- 관리 콘솔과 점장 포털에서 사용하는 Apollo Client 구성을 표준화하고 초기 UI/데이터 계약을 수립합니다.

## 완료 기준

- ✅ Apollo Client 인스턴스 (Auth Link, Error Link, Retry Link) 구성
- ✅ 코드젠 파이프라인(GraphQL Code Generator) 설정 및 샘플 쿼리 생성
- ✅ Attendance/Inventory 조회 화면 와이어프레임 연결
- ✅ 전역 상태 관리 가이드(`docs/frontend/README.md`) 업데이트

## 산출물

- ✅ `frontend/src` 초기 설정 커밋
- ✅ GraphQL 문서화(`docs/frontend/README.md`)
- ⏳ Storybook에 Attendance List, Inventory Snapshot 컴포넌트 목업 (향후 작업)

## 완료된 항목

### Apollo Client 설정
- ✅ `src/app/providers/apollo.tsx`에 Apollo Client 인스턴스 구성
  - HTTP Link: GraphQL Gateway 엔드포인트 연결
  - Auth Link: JWT 토큰 자동 추가
  - Error Link: GraphQL 및 네트워크 에러 처리 (401 자동 로그아웃)
  - Retry Link: 네트워크 에러 시 자동 재시도 (최대 3회)
  - InMemoryCache: 캐시 정책 설정

### GraphQL Code Generator 설정
- ✅ `codegen.ts` 설정 파일 생성
- ✅ `package.json`에 `codegen` 스크립트 추가
- ✅ 스키마 파일: `schemas/*.graphql` 참조
- ✅ 문서 파일: `src/**/*.graphql` 참조
- ✅ 생성된 타입: `src/shared/api/generated/` 디렉터리

### GraphQL 쿼리 파일
- ✅ `src/shared/api/graphql/attendance.graphql` - Attendance 관련 쿼리/뮤테이션
- ✅ `src/shared/api/graphql/inventory.graphql` - Inventory 관련 쿼리/뮤테이션
- ✅ `src/shared/api/graphql/sales.graphql` - Sales 관련 쿼리/뮤테이션
- ✅ `src/shared/api/graphql/product.graphql` - Product 관련 쿼리

### Attendance/Inventory 조회 화면
- ✅ `AttendanceRecordsPage` - 출퇴근 기록 조회 및 출근/퇴근 기록 기능
- ✅ `PendingApprovalsPage` - 승인 대기 목록 조회
- ✅ `DailyAttendanceReportPage` - 일별 근태 리포트
- ✅ `WeeklyAttendanceReportPage` - 주별 근태 리포트
- ✅ `PurchaseOrdersListPage` - 발주 목록 조회
- ✅ `PurchaseOrderDetailPage` - 발주 상세 조회
- ✅ `PurchaseOrderFormPage` - 발주 생성

### 테스트 설정
- ✅ Vitest + React Testing Library 설정
- ✅ Mock Apollo Client 유틸리티 (`src/test/mock-apollo-client.tsx`)
- ✅ GraphQL 쿼리 훅 테스트 예시 작성
  - `src/shared/api/graphql/__tests__/attendance-queries.test.tsx`
  - `src/shared/api/graphql/__tests__/inventory-queries.test.tsx`

### 문서화
- ✅ `docs/frontend/README.md` 업데이트
  - Apollo Client 설정 가이드
  - GraphQL 쿼리 작성 가이드
  - GraphQL 쿼리/뮤테이션 테스트 가이드
  - 코드젠 설정 및 사용법

## 검증

- ✅ Vitest + React Testing Library로 쿼리 훅 유닛 테스트 (예시 작성 완료)
- ⏳ GraphQL Inspector로 Schema 호환성 검사 (향후 작업)
- ⏳ QA Agent와 UI Walkthrough 진행 (향후 작업)

## 참고

- Apollo Client 설정: `frontend/src/app/providers/apollo.tsx`
- GraphQL 쿼리 파일: `frontend/src/shared/api/graphql/`
- 테스트 예시: `frontend/src/shared/api/graphql/__tests__/`
- 프론트엔드 문서: `docs/frontend/README.md`
