# Workflow Library

## 엔드투엔드 플로우

1. **Discover**: Product Strategist가 요구사항을 `/tasks/spec/`에 기록, 이해관계자 피드백 수집
2. **Design**: Backend/Frontend/Gateway 에이전트가 GraphQL 스키마, 데이터 모델, UI 플로우를 `/docs`와 `/prompts`에 반영
3. **Build**: 구현 태스크 생성 → 코드 작성 → Pull Request → 자동화 테스트 → PR 리뷰
4. **Deploy**: DevOps 에이전트가 CI 파이프라인 실행, Staging 배포, Canary 전략 적용 후 프로덕션 릴리즈
5. **Evaluate**: QA 에이전트가 `/evaluations`에 품질 리포트 기록, Analytics 에이전트가 KPI 측정
6. **Improve**: 회고에서 도출된 개선 항목을 `/tasks/backlog`로 이동

## 워크플로 템플릿

- `workflows/<name>.md` 파일을 생성하여 단계, 책임자, 체크리스트, 자동화 스크립트 등을 정의
- Mermaid 다이어그램을 활용해 서비스 간 인터랙션/데이터 플로 시각화
- 변경 시 관련 에이전트 태그 및 SPEC 반영을 요구

## 자동화 지침

- GitHub Actions에서 워크플로 파일 변경 시 리뷰어 자동 지정
- 슬랙 연동으로 단계별 완료 알림 전송
- 실패한 단계는 `/evaluations`에 자동 링크하여 원인 분석 기록
