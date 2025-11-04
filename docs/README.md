# Documentation Hub

## 구조

- `architecture/`: 시스템 다이어그램, 서비스 간 통신, 데이터 파이프라인
- `frontend/`: React 컴포넌트 가이드, 상태 관리, 디자인 시스템
- `backend/`: NestJS 마이크로서비스, GraphQL 스키마, 데이터베이스 문서
- `ops/`: 배포 전략, 인프라, 보안 정책, 관측성
- `analytics/`: KPI 정의, 데이터 모델, 리포트 템플릿
- `runbooks/`: 운영 가이드, 장애 대응, 온콜 절차

## 작성 원칙

- 모든 문서는 RFC 2119 용어(MUST/SHOULD/MAY)를 활용해 의도 전달
- 변경 시 SPEC 및 관련 태스크 링크를 명시해 추적 가능성 확보
- 다이어그램은 PlantUML 또는 Mermaid 원문 포함, 생성된 이미지 함께 보관
- 문서 템플릿은 `/docs/templates/`에 저장하고 팀 내 공유

## 추천 진행 순서

1. SPEC.md에서 최신 요구사항 확인
2. `/docs/architecture`의 서비스 정의 검토
3. `/prompts`나 `/tasks`에 필요한 아티팩트 링크 추가
4. 변경 사항을 PR로 제출하고 에이전트 리뷰 요청
