# Agent Directory

## 핵심 에이전트 역할

- **Product Strategist Agent**: SPEC.md 유지보수, 비즈니스 요구사항 정제, 페르소나 검증
- **Frontend Engineer Agent**: React UI 설계, GraphQL 쿼리/뮤테이션 최적화, 상태 관리 전략 정의
- **Backend Service Agent**: NestJS 마이크로서비스 설계, Federation 스키마 관리, 데이터 정합성 확보
- **GraphQL Gateway Agent**: BFF 정책 수립, 인증/인가 인터셉터 구성, 성능 모니터링
- **DevOps Agent**: CI/CD 파이프라인, IaC, 관측성 지표와 런북 관리
- **QA & Evaluation Agent**: 테스트 전략, 시나리오 실행, 품질 지표 보고
- **Analytics Agent**: 매출·재고 분석, 예측 모델 실험, 인사이트 리포트 작성

## 협업 모델

1. Product Strategist가 SPEC 업데이트 및 요구사항 백로그 정렬
2. Backend/Frontend/Gateway 에이전트가 스프린트별 설계·구현 태스크 수행
3. DevOps 에이전트가 배포 파이프라인, 환경 구성, 모니터링 설정
4. QA 에이전트가 테스트 계획을 실행하고 피드백 루프 생성
5. Analytics 에이전트가 데이터 품질과 인사이트 결과를 Product와 공유

## 운영 가이드

- 각 에이전트는 `/tasks` 템플릿을 사용해 작업을 선언하고 추적
- 프롬프트는 `/prompts`에서 버전 관리, 변경 시 리뷰 필수
- 워크플로 업데이트는 `/workflows` 문서와 동기화
- 평가 결과는 `/evaluations`에 누적, 향후 레트로의 근거로 활용
