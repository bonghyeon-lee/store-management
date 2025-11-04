---
title: "[Backend] Federation Schema Baseline"
owner: backend-service
status: in-progress
priority: high
due: 2025-11-08
related_prompts:
  - ../../prompts/backend-service-brief.md
  - ../../prompts/graphql-contract-review.md
---

## 목적

- Attendance, Inventory, Sales 서비스의 GraphQL Subgraph 스키마 초안을 정의하고 Federation 키 전략을 확정합니다.

## 완료 기준

- 서비스별 엔티티 타입/Mutation 정의 초안 작성
- Federation `@key`, `@requires`, `@provides` 설계 문서화
- Schema Registry(Apollo Rover) 등록 및 계약 테스트 통과
- Backend Runbook(`docs/backend/README.md`) 업데이트

## 산출물

- `schemas/attendance.graphql`, `schemas/inventory.graphql`, `schemas/sales.graphql` 초안 (생성됨)
- 설계 노트: `docs/backend/README.md` 업데이트 (추가됨)
- Schema Diff 리포트

## 검증

- GraphQL Inspector 계약 테스트
- Federation Gateway 로컬 통합 테스트
- QA Agent와 데이터 모델 리뷰 워크숍
