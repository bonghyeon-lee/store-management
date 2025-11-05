---
title: "[Frontend] Apollo Client Setup & UI Contract"
owner: frontend-engineer
status: todo
priority: high
due: 2025-11-15
related_prompts:
  - ../../prompts/frontend-wireframes.md
  - ../../prompts/graphql-contract-review.md
---

## 목적

- 관리 콘솔과 점장 포털에서 사용하는 Apollo Client 구성을 표준화하고 초기 UI/데이터 계약을 수립합니다.

## 완료 기준

- Apollo Client 인스턴스 (Auth Link, Error Link, Retry Link) 구성
- 코드젠 파이프라인(GraphQL Code Generator) 설정 및 샘플 쿼리 생성
- Attendance/Inventory 조회 화면 와이어프레임 연결
- 전역 상태 관리 가이드(`docs/frontend/README.md`) 업데이트

## 산출물

- `frontend/src` 초기 설정 커밋
- GraphQL 문서화(`docs/frontend/README.md`)
- Storybook에 Attendance List, Inventory Snapshot 컴포넌트 목업

## 검증

- Vitest + React Testing Library로 쿼리 훅 유닛 테스트
- GraphQL Inspector로 Schema 호환성 검사
- QA Agent와 UI Walkthrough 진행
