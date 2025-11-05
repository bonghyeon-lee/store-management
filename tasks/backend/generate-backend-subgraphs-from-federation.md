---
title: "[Backend] Generate Subgraph Services from Federation Schemas"
owner: backend-service
status: completed
priority: high
due: 2025-11-14
completed: 2025-01-27
related_tasks:
  - ./federation-schema.md
---

## 목적

- `schemas/attendance.graphql`, `schemas/inventory.graphql`, `schemas/sales.graphql`를 기반으로 NestJS + Apollo Federation Subgraph 서비스를 스캐폴딩합니다.

## 완료 기준

- 각 서비스(`attendance-service`, `inventory-service`, `sales-service`) 디렉터리 생성
- NestJS 앱 구성(`ApolloFederationDriver` + SDL-first) 및 기본 Resolver 구현
- 로컬 실행 스크립트(npm/yarn) 및 포트 할당
- `docs/backend/README.md`에 실행/등록/계약 테스트 절차 업데이트

## 산출물

- `backend/attendance-service/**`
- `backend/inventory-service/**`
- `backend/sales-service/**`
- 문서 업데이트 PR

## 완료된 항목

### 1. 서비스 디렉터리 생성
- ✅ `backend/attendance-service/` 디렉터리 생성 및 구조 완성
- ✅ `backend/inventory-service/` 디렉터리 생성 및 구조 완성
- ✅ `backend/sales-service/` 디렉터리 생성 및 구조 완성
- ✅ `backend/notification-service/` 디렉터리 생성 및 구조 완성
- ✅ `backend/auth-service/` 디렉터리 생성 및 구조 완성

### 2. NestJS 앱 구성
- ✅ 모든 서비스에 `ApolloFederationDriver` 설정 완료
- ✅ Code First 방식으로 GraphQL 스키마 자동 생성 설정
- ✅ `autoSchemaFile` 옵션으로 `schema.gql` 자동 생성
- ✅ 각 서비스에 기본 Resolver 구현 완료

### 3. 로컬 실행 스크립트 및 포트 할당
- ✅ 각 서비스의 `package.json`에 실행 스크립트 추가:
  - `start`: 프로덕션 실행
  - `start:dev`: 개발 모드 실행
  - `dev`: 핫 리로드 개발 모드
  - `build`: TypeScript 컴파일
  - `test`: 테스트 실행
- ✅ 포트 할당:
  - `attendance-service`: 4001
  - `inventory-service`: 4002
  - `sales-service`: 4003
  - `notification-service`: 4004
  - `auth-service`: 4005
  - `gateway-service`: 4000

### 4. 문서 업데이트
- ✅ `docs/backend/README.md`에 실행/등록/계약 테스트 절차 문서화 완료
- ✅ Federation 키 전략 문서화
- ✅ GraphQL Inspector 사용법 문서화
- ✅ Apollo Rover CLI 사용법 문서화 (선택사항)

## 메모

- 실제 의존성 설치/실행은 네트워크/환경에 따라 별도 수행 필요
- Apollo Rover/Inspector 연계는 문서 절차에 따를 것


