---
title: "[Tests] 테스트 프레임워크 설정"
owner: backend-team, frontend-team
status: todo
priority: high
due: 2025-11-15
related_prompts:
  - ../prompts/test-strategy.md
---

## 목적

백엔드 및 프론트엔드 서비스에 대한 테스트 프레임워크를 설정합니다. 각 서비스에 적합한 테스트 도구를 선택하고, 표준화된 테스트 환경을 구축합니다.

## 완료 기준

### 1. 백엔드 테스트 프레임워크 설정

- [ ] Jest 또는 Vitest 기반 테스트 프레임워크 선택 및 설치
  - [ ] 각 백엔드 서비스 (Attendance, Inventory, Sales, Auth, Notification)에 테스트 의존성 설치
  - [ ] Jest/Vitest 설정 파일 구성 (`jest.config.ts` 또는 `vitest.config.ts`)
  - [ ] TypeScript 지원 설정
  - [ ] 테스트 커버리지 도구 설정 (Istanbul/NYC 또는 Vitest 커버리지)
- [ ] GraphQL 테스트 유틸리티 설정
  - [ ] Apollo Server Testing 라이브러리 설정
  - [ ] GraphQL 쿼리/뮤테이션 테스트 헬퍼 함수 작성
- [ ] 데이터베이스 테스트 환경 설정
  - [ ] 테스트용 데이터베이스 설정 (Docker 또는 in-memory DB)
  - [ ] 테스트 전후 데이터 정리 (setup/teardown) 로직 구현
  - [ ] 트랜잭션 롤백을 통한 데이터 격리
- [ ] Mock 및 Stub 설정
  - [ ] 외부 서비스 Mock 설정 (예: 이메일 서비스, 외부 API)
  - [ ] 공통 Mock 유틸리티 함수 작성

### 2. 프론트엔드 테스트 프레임워크 설정

- [ ] Vitest 또는 React Testing Library 기반 테스트 프레임워크 설정
  - [ ] Vitest 설치 및 설정 (`vitest.config.ts`)
  - [ ] React Testing Library 설치 및 설정
  - [ ] TypeScript 지원 설정
  - [ ] 테스트 커버리지 도구 설정
- [ ] Apollo Client 테스트 환경 설정
  - [ ] MockedProvider 설정
  - [ ] GraphQL 쿼리/뮤테이션 Mock 헬퍼 함수 작성
- [ ] 컴포넌트 테스트 환경 설정
  - [ ] MUI 테마 Provider Mock 설정
  - [ ] 라우터 Mock 설정 (React Router)
  - [ ] Redux Store Mock 설정 (필요 시)
- [ ] E2E 테스트 환경 설정 (선택사항)
  - [ ] Cypress 또는 Playwright 설치 및 기본 설정
  - [ ] E2E 테스트 디렉토리 구조 생성

### 3. 공통 테스트 설정

- [ ] 테스트 스크립트 추가
  - [ ] 각 서비스의 `package.json`에 테스트 스크립트 추가
    - `test`: 단위 테스트 실행
    - `test:watch`: Watch 모드 테스트 실행
    - `test:coverage`: 커버리지 리포트 생성
    - `test:e2e`: E2E 테스트 실행 (프론트엔드)
- [ ] CI/CD 통합
  - [ ] GitHub Actions 워크플로에 테스트 실행 단계 확인
  - [ ] 테스트 실패 시 CI 실패 처리 확인
  - [ ] 커버리지 리포트 업로드 (선택사항)
- [ ] 테스트 디렉토리 구조 표준화
  - [ ] 백엔드: `src/**/*.spec.ts` 또는 `src/**/*.test.ts`
  - [ ] 프론트엔드: `src/**/*.test.tsx` 또는 `__tests__/**/*.test.tsx`
  - [ ] 통합 테스트: `tests/integration/**/*.test.ts`

## 산출물

- 각 서비스의 테스트 프레임워크 설정 파일
  - 백엔드: `backend/*/jest.config.ts` 또는 `backend/*/vitest.config.ts`
  - 프론트엔드: `frontend/vitest.config.ts`
- 테스트 스크립트 설정
  - 각 서비스의 `package.json`에 테스트 스크립트 추가
- 공통 테스트 유틸리티
  - `tests/utils/test-helpers.ts` - 공통 테스트 헬퍼 함수
  - `tests/utils/graphql-test-helpers.ts` - GraphQL 테스트 헬퍼 함수
  - `tests/utils/mock-data.ts` - 공통 Mock 데이터
- 테스트 설정 문서
  - `docs/tests/test-framework-setup.md` - 테스트 프레임워크 설정 가이드

## 검증

- [ ] 모든 서비스에서 테스트 스크립트 실행 성공 확인
- [ ] 테스트 커버리지 리포트 생성 확인
- [ ] CI/CD 파이프라인에서 테스트 자동 실행 확인
- [ ] 샘플 테스트 작성 및 실행 확인
- [ ] 코드 리뷰 완료

## 참고사항

- Jest vs Vitest: 프로젝트 표준에 따라 선택 (TypeScript 지원, 성능, ESM 지원 등 고려)
- 백엔드 테스트는 NestJS의 기본 테스트 유틸리티 활용
- 프론트엔드 테스트는 React Testing Library의 Best Practice 준수
- E2E 테스트는 M1에서 본격적으로 구현 예정 (현재는 기본 설정만)

