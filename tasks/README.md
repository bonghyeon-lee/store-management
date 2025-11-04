# Task Backlog Guide

## 태스크 유형

- **Spec & Research**: 요구사항 수집, 규정 검토, 마켓 리서치
- **Frontend**: React UI, GraphQL 쿼리/뮤테이션 통합, 접근성 개선
- **Backend**: NestJS 마이크로서비스, 데이터 모델링, Federation 스키마 조정
- **Platform/Ops**: CI/CD, IaC, 모니터링, 보안 점검
- **QA & Evaluation**: 테스트 플랜 작성, 자동화 스크립트, 품질 지표 분석
- **Analytics**: 매출/재고 리포트, 예측 모델 실험, KPI 정의

## 템플릿 구조 (`tasks/<service>/<topic>.md`)

```md
---
title: "[Service] 작업 제목"
owner: agent-id
status: todo | in-progress | done
priority: high | medium | low
due: YYYY-MM-DD
related_prompts:
  - ../prompts/<prompt-file>.md
---

## 목적
- 작업의 비즈니스/기술적 배경을 서술

## 완료 기준
- 명확한 Acceptance Criteria 항목별 리스트

## 산출물
- 코드/문서/배포 링크 등

## 검증
- 테스트, 리뷰, 평가 계획을 명시
```

## 운영 지침

- 대규모 기능은 Epic 태스크(`/tasks/epics/`)로 나누고 Child 태스크 링크 추가
- 주간 스프린트 시작 시 `status` 필드를 업데이트하여 진행상황 추적
- 완료된 태스크는 관련 SPEC/Docs 업데이트 여부를 반드시 확인
- 회고 시 `/evaluations`의 결과를 참조해 다음 스프린트 개선점 도출
