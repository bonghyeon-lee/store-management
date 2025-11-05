---
title: "[Tests] 단위 테스트 작성"
owner: backend-team, frontend-team
status: todo
priority: high
due: 2025-11-20
related_prompts:
  - ../prompts/test-strategy.md
---

## 목적

각 서비스의 핵심 비즈니스 로직에 대한 단위 테스트를 작성합니다. Resolver, Service, Model, 컴포넌트, Hook 등 핵심 모듈에 대한 테스트를 구현하여 코드 품질과 안정성을 보장합니다.

## 완료 기준

### 1. 백엔드 단위 테스트

- [ ] Attendance 서비스 단위 테스트
  - [ ] `employee.resolver.ts` - Employee Query/Mutation 테스트
  - [ ] `attendance.resolver.ts` - Attendance Query/Mutation 테스트
  - [ ] `report.resolver.ts` - Report Query 테스트
  - [ ] `employee.service.ts` - 직원 관리 비즈니스 로직 테스트
  - [ ] `attendance.service.ts` - 근태 관리 비즈니스 로직 테스트
  - [ ] `report.service.ts` - 리포트 생성 로직 테스트
  - [ ] 입력 검증 테스트 (Validation Pipe)
  - [ ] 에러 처리 테스트 (예외 케이스)
- [ ] Inventory 서비스 단위 테스트
  - [ ] `product.resolver.ts` - Product Query/Mutation 테스트
  - [ ] `inventory.resolver.ts` - Inventory Query/Mutation 테스트
  - [ ] `purchase-order.resolver.ts` - PurchaseOrder Query/Mutation 테스트
  - [ ] `product.service.ts` - 상품 관리 비즈니스 로직 테스트
  - [ ] `inventory.service.ts` - 재고 관리 비즈니스 로직 테스트
  - [ ] `reorder.service.ts` - 리오더 추천 로직 테스트
  - [ ] DataLoader 테스트 (N+1 방지 검증)
- [ ] Sales 서비스 단위 테스트
  - [ ] `sales.resolver.ts` - Sales Query/Mutation 테스트
  - [ ] `sales.service.ts` - 매출 집계 비즈니스 로직 테스트
  - [ ] `report.service.ts` - 리포트 생성 로직 테스트
  - [ ] 날짜 범위 필터링 테스트
- [ ] Auth 서비스 단위 테스트
  - [ ] `auth.resolver.ts` - Auth Query/Mutation 테스트
  - [ ] `auth.service.ts` - 인증/인가 비즈니스 로직 테스트
  - [ ] JWT 토큰 생성/검증 테스트
  - [ ] 권한 검증 로직 테스트
- [ ] Notification 서비스 단위 테스트
  - [ ] `notification.resolver.ts` - Notification Query/Mutation 테스트
  - [ ] `notification.service.ts` - 알림 발송 비즈니스 로직 테스트
  - [ ] 템플릿 렌더링 로직 테스트
  - [ ] 이메일 발송 Mock 테스트

### 2. 프론트엔드 단위 테스트

- [ ] 컴포넌트 테스트
  - [ ] 공통 컴포넌트 테스트 (Button, Input, Table 등)
  - [ ] 페이지 컴포넌트 테스트 (EmployeeList, AttendanceList 등)
  - [ ] 폼 컴포넌트 테스트 (EmployeeForm, AttendanceForm 등)
  - [ ] 사용자 인터랙션 테스트 (클릭, 입력, 제출 등)
- [ ] Hook 테스트
  - [ ] GraphQL 쿼리 Hook 테스트 (useEmployees, useAttendance 등)
  - [ ] GraphQL 뮤테이션 Hook 테스트 (useCreateEmployee 등)
  - [ ] 커스텀 Hook 테스트 (useAuth, useNotification 등)
- [ ] 유틸리티 함수 테스트
  - [ ] 날짜 포맷팅 함수 테스트
  - [ ] 데이터 변환 함수 테스트
  - [ ] 검증 함수 테스트
- [ ] Redux/상태 관리 테스트 (필요 시)
  - [ ] Redux Slice 테스트
  - [ ] 액션 생성자 테스트
  - [ ] 리듀서 테스트

### 3. 테스트 커버리지 목표

- [ ] 커버리지 목표 설정
  - 백엔드: 핵심 비즈니스 로직 80% 이상
  - 프론트엔드: 핵심 컴포넌트 및 Hook 70% 이상
- [ ] 커버리지 리포트 생성 및 모니터링
  - [ ] CI/CD에서 커버리지 리포트 자동 생성
  - [ ] 커버리지 감소 시 CI 실패 처리 (선택사항)

### 4. 테스트 작성 가이드라인 준수

- [ ] AAA 패턴 (Arrange, Act, Assert) 준수
- [ ] 테스트 케이스 명명 규칙 준수 (`describe`, `it` 사용)
- [ ] Mock 데이터 활용 (실제 데이터베이스 의존성 최소화)
- [ ] 테스트 독립성 보장 (각 테스트가 독립적으로 실행 가능)
- [ ] 에지 케이스 테스트 포함 (null, undefined, 빈 배열 등)

## 산출물

- 각 서비스의 단위 테스트 파일
  - 백엔드: `backend/*/src/**/*.spec.ts` 또는 `backend/*/src/**/*.test.ts`
  - 프론트엔드: `frontend/src/**/*.test.tsx`
- 테스트 커버리지 리포트
  - `coverage/` 디렉토리에 커버리지 리포트 생성
- 테스트 작성 가이드 문서
  - `docs/tests/unit-testing-guide.md` - 단위 테스트 작성 가이드

## 검증

- [ ] 모든 단위 테스트 실행 및 통과 확인
- [ ] 테스트 커버리지 목표 달성 확인
- [ ] CI/CD 파이프라인에서 단위 테스트 자동 실행 확인
- [ ] 테스트 실행 속도 확인 (빠른 피드백 루프)
- [ ] 코드 리뷰 완료

## 참고사항

- 백엔드 테스트는 NestJS의 `@nestjs/testing` 패키지 활용
- 프론트엔드 테스트는 React Testing Library의 사용자 중심 테스트 접근법 준수
- Mock 데이터는 `tests/fixtures/` 디렉토리에 공통 관리
- 테스트 커버리지 100%를 목표로 하지 않음 (핵심 로직에 집중)
