---
title: "[Ops] 개발용 Docker Compose 설정"
owner: ops-team
status: completed
priority: medium
due: 2025-11-10
related_prompts:
  - ../prompts/release-pipeline-design.md
---

## 목적

로컬 개발 환경에서 코드 변경사항이 바로 반영되는 개발용 Docker Compose 파일을 생성합니다. 핫 리로드(Hot Reload) 기능을 통해 개발 생산성을 향상시킵니다.

## 완료 기준

### 1. 개발용 Docker Compose 파일 생성

- [x] `docker-compose.dev.yml` 파일 생성
  - [x] 모든 백엔드 서비스에 소스 코드 볼륨 마운트 설정
  - [x] 프론트엔드에 소스 코드 볼륨 마운트 설정
  - [x] node_modules는 named volume로 처리하여 성능 최적화
  - [x] 개발용 환경 변수 설정
  - [x] 개발 모드로 실행되도록 설정

### 2. 백엔드 서비스 핫 리로드 설정

- [x] 각 백엔드 서비스에 개발용 스크립트 추가
  - [x] `nodemon` 또는 `ts-node-dev` 사용
  - [x] TypeScript 파일 변경 감지 및 자동 재시작
  - [x] GraphQL 스키마 변경 감지
- [x] 개발용 Dockerfile 또는 docker-compose override 설정
  - [x] 소스 코드 볼륨 마운트
  - [x] 개발 의존성 포함
  - [x] 핫 리로드 도구 설치 및 실행

### 3. 프론트엔드 핫 리로드 설정

- [x] Vite 개발 서버 모드로 실행
  - [x] 소스 코드 볼륨 마운트
  - [x] Vite HMR(Hot Module Replacement) 활성화
  - [x] 포트 포워딩 설정 (5173)
- [x] 개발용 환경 변수 설정
  - [x] API URL 설정
  - [x] 개발 모드 활성화

### 4. 데이터베이스 및 인프라 설정

- [x] PostgreSQL 볼륨 마운트 설정
  - [x] 데이터 영속성 보장
  - [ ] 개발용 데이터 초기화 스크립트 (선택사항)
- [x] Redis 설정
  - [x] 데이터 영속성 보장
- [x] 네트워크 설정 유지

### 5. 문서화

- [x] 개발 환경 실행 가이드 작성
  - [x] `docker-compose -f docker-compose.dev.yml up` 사용법
  - [x] 환경 변수 설정 방법
  - [x] 문제 해결 가이드
- [x] 기존 `docs/ops/development-setup.md` 업데이트
  - [x] 개발용 compose 파일 사용법 추가

## 산출물

- [x] `docker-compose.dev.yml` - 개발용 Docker Compose 파일
- [x] 각 서비스의 `package.json`에 개발용 스크립트 추가
  - [x] `dev` 또는 `dev:watch` 스크립트
- [x] 업데이트된 개발 환경 문서 (`docs/ops/development-setup.md`)

## 기술 요구사항

### 백엔드 서비스

- 소스 코드 볼륨 마운트: `./backend/{service}/src:/app/src`
- node_modules 볼륨: `{service}_node_modules:/app/node_modules`
- 개발 모드 실행: `npm run dev` 또는 `nodemon --watch src --ext ts --exec ts-node src/main.ts`
- 환경 변수: `NODE_ENV=development`

### 프론트엔드

- 소스 코드 볼륨 마운트: `./frontend:/app`
- node_modules 볼륨: `frontend_node_modules:/app/node_modules`
- 개발 서버 실행: `npm run dev` (Vite 개발 서버)
- 포트: `5173:5173`

### 공통

- 모든 서비스가 기존 `docker-compose.yml`과 동일한 네트워크 사용
- 데이터베이스 및 Redis는 기존 설정 유지
- 헬스 체크는 개발 모드에서도 유지

## 검증

- [ ] `docker-compose -f docker-compose.dev.yml up` 실행 테스트
- [ ] 백엔드 서비스 코드 변경 시 자동 재시작 확인
- [ ] 프론트엔드 코드 변경 시 HMR 동작 확인
- [ ] 모든 서비스가 정상적으로 시작되는지 확인
- [ ] 데이터베이스 연결 및 GraphQL 쿼리 테스트
- [ ] 포트 충돌 없는지 확인

## 참고사항

- 기존 `docker-compose.yml`은 프로덕션용으로 유지
- 개발용 compose는 로컬 개발 환경에서만 사용
- CI/CD 파이프라인에서는 프로덕션용 compose 사용
- node_modules 볼륨 사용으로 성능 최적화 (호스트와 컨테이너 간 node_modules 공유 방지)
