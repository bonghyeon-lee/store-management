---
title: "[Tests] 통합 테스트 작성"
owner: backend-team, frontend-team
status: todo
priority: high
due: 2025-11-25
related_prompts:
  - ../prompts/test-strategy.md
---

## 목적

서비스 간 통합 및 GraphQL API 통합 테스트를 작성합니다. 실제 데이터베이스와 연동하여 전체 워크플로를 검증하고, 서비스 간 데이터 조인 및 인증/인가를 테스트합니다.

## 완료 기준

### 1. GraphQL API 통합 테스트

- [ ] Attendance 서비스 통합 테스트
  - [ ] Employee CRUD 워크플로 테스트
  - [ ] 출퇴근 기록 생성 및 조회 테스트
  - [ ] 근태 승인 워크플로 테스트 (승인/거부)
  - [ ] 리포트 생성 테스트 (일별/주별)
  - [ ] GraphQL 에러 처리 테스트
- [ ] Inventory 서비스 통합 테스트
  - [ ] Product CRUD 워크플로 테스트
  - [ ] 재고 실사 입력 및 조회 테스트
  - [ ] 리오더 추천 생성 테스트
  - [ ] 발주 요청 및 입고 처리 워크플로 테스트
  - [ ] InventoryItem → Product 조인 테스트 (Federation)
- [ ] Sales 서비스 통합 테스트
  - [ ] 매출 데이터 입력 및 조회 테스트
  - [ ] 일별/주별/월별 매출 집계 테스트
  - [ ] 대시보드 데이터 조회 테스트
  - [ ] 날짜 범위 필터링 테스트
- [ ] Auth 서비스 통합 테스트
  - [ ] 로그인/로그아웃 워크플로 테스트
  - [ ] JWT 토큰 검증 테스트
  - [ ] 권한 기반 접근 제어 테스트
  - [ ] Refresh Token 갱신 테스트
- [ ] Notification 서비스 통합 테스트
  - [ ] 알림 발송 워크플로 테스트
  - [ ] 템플릿 기반 알림 생성 테스트
  - [ ] 알림 이력 조회 테스트

### 2. 서비스 간 데이터 조인 테스트

- [ ] Federation 통합 테스트
  - [ ] InventoryItem → Product 조인 테스트
  - [ ] Employee → Store 조인 테스트 (향후 구현 시)
  - [ ] 여러 서비스 간 복합 쿼리 테스트
- [ ] DataLoader 패턴 검증
  - [ ] N+1 문제 해결 확인 테스트
  - [ ] 배치 로딩 동작 확인 테스트
  - [ ] 캐싱 동작 확인 테스트

### 3. 인증/인가 통합 테스트

- [ ] 인증 미들웨어 통합 테스트
  - [ ] JWT 토큰 검증 테스트
  - [ ] 토큰 만료 처리 테스트
  - [ ] 잘못된 토큰 처리 테스트
- [ ] 권한 기반 접근 제어 테스트
  - [ ] HQ 관리자 권한 테스트
  - [ ] 점장 권한 테스트
  - [ ] 직원 권한 테스트
  - [ ] 권한 없는 접근 거부 테스트
- [ ] Field Level Authorization 테스트
  - [ ] 직급별 데이터 접근 제한 테스트
  - [ ] 민감 정보 마스킹 테스트

### 4. E2E 테스트 시나리오

- [ ] 핵심 사용자 여정 테스트
  - [ ] 직원 출퇴근 기록 → 점장 승인 워크플로
  - [ ] 재고 실사 입력 → 리오더 추천 생성 워크플로
  - [ ] 매출 데이터 입력 → 리포트 생성 워크플로
  - [ ] 발주 요청 → 승인 → 입고 처리 워크플로
- [ ] 프론트엔드 E2E 테스트 (Cypress 또는 Playwright)
  - [ ] 로그인 플로우 테스트
  - [ ] Employee 관리 페이지 E2E 테스트
  - [ ] Attendance 관리 페이지 E2E 테스트
  - [ ] Inventory 관리 페이지 E2E 테스트
  - [ ] 리포트 페이지 E2E 테스트

### 5. 통합 테스트 환경 설정

- [ ] 테스트 데이터베이스 설정
  - [ ] Docker Compose를 통한 테스트 환경 구성
  - [ ] 테스트 전후 데이터 정리 (setup/teardown)
  - [ ] 시드 데이터 생성 및 관리
- [ ] 테스트 격리 보장
  - [ ] 각 테스트 간 데이터 격리
  - [ ] 트랜잭션 롤백을 통한 데이터 정리
  - [ ] 병렬 테스트 실행 지원 (선택사항)

## 산출물

- 통합 테스트 파일
  - 백엔드: `tests/integration/**/*.test.ts`
  - 프론트엔드: `tests/e2e/**/*.test.ts` (Cypress/Playwright)
- 통합 테스트 환경 설정
  - `tests/docker-compose.test.yml` - 테스트용 Docker Compose 파일
  - `tests/setup/test-setup.ts` - 테스트 환경 설정 파일
  - `tests/fixtures/` - 통합 테스트용 Fixture 데이터
- 통합 테스트 문서
  - `docs/tests/integration-testing-guide.md` - 통합 테스트 작성 가이드

## 검증

- [ ] 모든 통합 테스트 실행 및 통과 확인
- [ ] 실제 데이터베이스와 연동하여 테스트 실행 확인
- [ ] 서비스 간 데이터 조인 정상 동작 확인
- [ ] 인증/인가 정상 동작 확인
- [ ] E2E 테스트 시나리오 통과 확인
- [ ] CI/CD 파이프라인에서 통합 테스트 자동 실행 확인
- [ ] 코드 리뷰 완료

## 참고사항

- 통합 테스트는 실제 데이터베이스를 사용하지만, 프로덕션 데이터와 완전히 격리
- Federation 통합 테스트는 이미 `tests/federation-integration.test.ts`에 구현되어 있음
- E2E 테스트는 Cypress 또는 Playwright 중 선택 (프로젝트 표준에 따라)
- 통합 테스트 실행 시간 최적화 (병렬 실행, 데이터베이스 풀링 등)

