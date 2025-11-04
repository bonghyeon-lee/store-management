# Evaluation Framework

## 평가 목표

- Feature 출시 전 품질 확보, 사용자 경험 개선, 운영 안정성을 정량화하기 위한 기준을 제공합니다.

## 핵심 메트릭

- **기능 품질**: 테스트 커버리지, 회귀 건수, 버그 해결 리드타임
- **성능**: GraphQL p95 응답 시간, 에러율, 스루풋
- **사용성**: NPS, 태스크 완료 시간, 주요 플로우 이탈률
- **운영 안정성**: 장애 대응 시간(MTTA/MTTR), 알람 처리율, Uptime
- **데이터 신뢰성**: 매출/재고 데이터 오차율, 동기화 지연

## 평가 문서 템플릿 (`evaluations/<release>/summary.md`)

```md
---
release: vYYYY.MM.DD
owners:
  - qa-agent
  - analytics-agent
scope:
  - features:
      - Attendance Shift Planner
      - Inventory Reorder Suggestion
  - services:
      - attendance
      - sales
---

## 하이라이트
- 긍정적인 결과, 주요 개선 사항

## 검증 결과
- 테스트 커버리지, 버그 현황, 성능 지표

## 리스크 & 액션 아이템
- 발견된 문제와 후속 태스크 링크(`/tasks`)
```

## 워크플로 연계

- CI 단계에서 자동으로 성능/테스트 리포트를 수집하여 `/evaluations/latest`로 커밋
- 회고 미팅 후 업데이트된 지표는 SPEC 및 `/docs/roadmap.md`에 반영
- 크리티컬 이슈 발생 시 재평가 문서를 생성해 히스토리 유지
