---
title: "[Backend] Generate Subgraph Services from Federation Schemas"
owner: backend-service
status: in-progress
priority: high
due: 2025-11-10
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

## 메모

- 실제 의존성 설치/실행은 네트워크/환경에 따라 별도 수행 필요
- Apollo Rover/Inspector 연계는 문서 절차에 따를 것


