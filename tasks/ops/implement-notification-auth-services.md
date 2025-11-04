---
title: "[Ops] Notification & Auth 서비스 구현 (GitHub Actions 선행 작업)"
owner: backend-team
status: todo
priority: high
due: 2025-11-10
related_tasks:
  - ./fix-github-actions-failure-0f75c29.md
  - ../backend/notification-service-mvp.md
  - ../backend/auth-service-mvp.md
---

## 목적

GitHub Actions CI/CD 파이프라인이 정상 동작하도록 필수 서비스인 `notification-service`와 `auth-service`를 구현합니다. 이 작업은 CI/CD 파이프라인 수정 작업의 선행 작업입니다.

## 배경

커밋 `0f75c29`에서 발생한 GitHub Actions 실패 원인 중 하나는 CI/CD 파이프라인에서 참조하는 `notification-service`와 `auth-service`가 실제로 구현되지 않았기 때문입니다. 이 서비스들을 구현하여 CI/CD 파이프라인이 정상적으로 동작하도록 합니다.

## 완료 기준

### 1. notification-service 구현

- [ ] `backend/notification-service/` 디렉토리 생성
- [ ] NestJS 프로젝트 초기 설정
  - [ ] `package.json` 생성 (기존 서비스와 동일한 의존성)
  - [ ] `tsconfig.json` 생성
  - [ ] 기본 NestJS + GraphQL Apollo Federation 설정
- [ ] GraphQL Schema 기본 구조 구현
  - [ ] `src/models/` 디렉토리 및 기본 모델 정의
  - [ ] `src/resolvers/` 디렉토리 및 기본 Resolver 구현
  - [ ] `src/modules/app.module.ts` 구현
- [ ] `src/main.ts` 구현 (포트 4004)
- [ ] `Dockerfile` 생성 (기존 서비스와 동일한 구조)
- [ ] `schema.gql` 자동 생성 설정
- [ ] 헬스 체크 엔드포인트 구현 (`/health`)
- [ ] 로컬 실행 테스트
- [ ] 관련 태스크 참조: `../backend/notification-service-mvp.md`

### 2. auth-service 구현

- [ ] `backend/auth-service/` 디렉토리 생성
- [ ] NestJS 프로젝트 초기 설정
  - [ ] `package.json` 생성 (기존 서비스와 동일한 의존성)
  - [ ] `tsconfig.json` 생성
  - [ ] 기본 NestJS + GraphQL Apollo Federation 설정
- [ ] GraphQL Schema 기본 구조 구현
  - [ ] `src/models/` 디렉토리 및 기본 모델 정의
  - [ ] `src/resolvers/` 디렉토리 및 기본 Resolver 구현
  - [ ] `src/modules/app.module.ts` 구현
- [ ] `src/main.ts` 구현 (포트 4005)
- [ ] `Dockerfile` 생성 (기존 서비스와 동일한 구조)
- [ ] `schema.gql` 자동 생성 설정
- [ ] 헬스 체크 엔드포인트 구현 (`/health`)
- [ ] 로컬 실행 테스트
- [ ] 관련 태스크 참조: `../backend/auth-service-mvp.md`

### 3. Gateway 서비스 업데이트

새로 구현된 서비스들을 Gateway에 연결합니다.

- [ ] `backend/gateway-service/src/index.ts` 수정
  - [ ] notification-service URL 추가 (포트 4004)
  - [ ] auth-service URL 추가 (포트 4005)
  - [ ] Gateway subgraphs에 notification, auth 추가
  - [ ] `waitForUrl` 함수에 새 서비스 URL 추가
- [ ] 환경 변수 추가 (`NOTIFICATION_URL`, `AUTH_URL`)
- [ ] Gateway 통합 테스트
  - [ ] 모든 서비스가 정상적으로 연결되는지 확인
  - [ ] Federation 스키마 통합 확인

### 4. Docker Compose 업데이트 (선택사항)

로컬 개발 환경에서 모든 서비스를 실행할 수 있도록 docker-compose.yml 업데이트

- [ ] `docker-compose.yml`에 notification-service 추가
- [ ] `docker-compose.yml`에 auth-service 추가
- [ ] 서비스 간 네트워크 연결 확인
- [ ] 로컬 환경에서 전체 서비스 실행 테스트

## 산출물

- `backend/notification-service/` 디렉토리 및 전체 코드
- `backend/auth-service/` 디렉토리 및 전체 코드
- Gateway 서비스 업데이트 (subgraphs 연결)
- Docker 이미지 빌드 가능한 상태

## 검증

- [ ] 각 서비스가 독립적으로 실행되는지 확인
- [ ] 각 서비스의 헬스 체크 엔드포인트가 정상 동작하는지 확인
- [ ] Gateway에서 모든 서비스가 정상 연결되는지 확인
- [ ] Docker 이미지 빌드가 성공하는지 확인
- [ ] CI/CD 파이프라인에서 서비스 빌드가 성공하는지 확인

## 참고 사항

- 실제 서비스 디렉토리: `backend/{service-name}-service/`
- Dockerfile 위치: `backend/{service-name}-service/Dockerfile`
- 기존 서비스 참고: `attendance-service`, `inventory-service`, `sales-service`의 구조를 참고하여 구현
- 포트 할당:
  - notification-service: 4004
  - auth-service: 4005
- 관련 태스크:
  - `tasks/backend/notification-service-mvp.md` - 상세 기능 구현 가이드
  - `tasks/backend/auth-service-mvp.md` - 상세 기능 구현 가이드
  - `tasks/ops/fix-github-actions-failure-0f75c29.md` - 이 작업 완료 후 수행할 작업

## 다음 단계

이 작업이 완료되면 다음 작업을 수행합니다:

1. `tasks/ops/fix-github-actions-failure-0f75c29.md`에서 GitHub Actions 워크플로우 수정
2. CI/CD 파이프라인에 새 서비스 추가 및 재검증

