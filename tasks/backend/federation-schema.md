---
title: "[Backend] Federation Schema Baseline"
owner: backend-service
status: completed
priority: high
due: 2025-11-12
completed: 2025-01-27
related_prompts:
  - ../../prompts/backend-service-brief.md
  - ../../prompts/graphql-contract-review.md
---

## 목적

- Attendance, Inventory, Sales 서비스의 GraphQL Subgraph 스키마 초안을 정의하고 Federation 키 전략을 확정합니다.

## 완료 기준

- ✅ 서비스별 엔티티 타입/Mutation 정의 초안 작성
- ✅ Federation `@key`, `@requires`, `@provides` 설계 문서화
- ✅ GraphQL Inspector를 사용한 계약 테스트 설정
- ✅ Backend Runbook(`docs/backend/README.md`) 업데이트

## 완료된 항목

### 1. 스키마 정의
- ✅ `schemas/attendance.graphql` - Attendance 서비스 스키마 정의
- ✅ `schemas/inventory.graphql` - Inventory 서비스 스키마 정의
- ✅ `schemas/sales.graphql` - Sales 서비스 스키마 정의
- ✅ `schemas/auth.graphql` - Auth 서비스 스키마 정의
- ✅ `schemas/notification.graphql` - Notification 서비스 스키마 정의

### 2. Federation 디렉티브 문서화
- ✅ `@key` 디렉티브 사용 전략 문서화 (`docs/backend/federation-schema-guide.md`)
- ✅ `@requires` 디렉티브 사용 전략 및 예시 문서화
- ✅ `@provides` 디렉티브 사용 전략 및 예시 문서화
- ✅ `@external` 디렉티브 사용 규칙 문서화
- ✅ Federation 디렉티브 사용 가이드라인 및 성능 고려사항 문서화

### 3. 계약 테스트 설정
- ✅ GraphQL Inspector 설치 및 설정 (`package.json`)
- ✅ 스키마 유효성 검증 스크립트 작성 (`scripts/validate-schemas.js`)
- ✅ 스키마 변경사항 감지 스크립트 작성 (`scripts/diff-schemas.js`)
- ✅ Federation 통합 검증 스크립트 작성 (`scripts/verify-federation.js`)
- ✅ npm 스크립트 추가 (`schema:validate`, `schema:diff`, `schema:verify`)

### 4. 문서 업데이트
- ✅ `docs/backend/README.md` - Registry/Contract Test 절차 업데이트
- ✅ `docs/backend/federation-schema-guide.md` - Federation 디렉티브 상세 문서화

## 산출물

- ✅ `schemas/attendance.graphql`, `schemas/inventory.graphql`, `schemas/sales.graphql` 초안 (생성됨)
- ✅ `schemas/auth.graphql`, `schemas/notification.graphql` 초안 (생성됨)
- ✅ 설계 노트: `docs/backend/README.md` 업데이트 (완료)
- ✅ Federation 디렉티브 가이드: `docs/backend/federation-schema-guide.md` 업데이트 (완료)
- ✅ 스키마 검증 스크립트: `scripts/validate-schemas.js`, `scripts/diff-schemas.js` (생성됨)

## 검증

- ✅ GraphQL Inspector 계약 테스트 설정 완료
- ✅ Federation Gateway 로컬 통합 테스트 스크립트 작성 완료
- ⏳ 실제 서비스 실행 후 통합 테스트 수행 필요

## 참고사항

- Apollo Rover CLI를 사용한 Schema Registry 등록은 선택사항입니다 (Apollo Studio 계정 필요)
- GraphQL Inspector를 사용한 로컬 스키마 검증이 기본 설정으로 포함되어 있습니다
- CI/CD 파이프라인에 스키마 검증 단계를 추가하는 것을 권장합니다
