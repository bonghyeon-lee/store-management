# Prompt Guidelines

## 목적

- Agent Driven Development 흐름에서 일관된 커뮤니케이션과 자동화된 태스크 생성을 위한 프롬프트 집합을 관리합니다.

## 프롬프트 카테고리

- **Discovery Prompts**: 요구사항 정리, 페르소나 검증, 경쟁 분석
- **Design Prompts**: GraphQL 스키마 초안, UI 와이어프레임, 데이터 모델 리뷰
- **Implementation Prompts**: 서비스별 NestJS 코드 템플릿, React 컴포넌트 패턴, GraphQL Resolver 가이드
- **Ops Prompts**: CI/CD 파이프라인 정의, IaC 변경 검토, 관측성 지표 설정
- **QA Prompts**: 테스트 케이스 생성, 회귀 테스트 체크리스트, 시나리오 기반 평가
- **Analytics Prompts**: KPI 리포트 생성, 이상 탐지 질문, 예측 모델 회고

## 관리 원칙

- 모든 프롬프트는 `prompt-name.md` 형식의 파일로 저장하고 메타데이터(YAML front matter) 포함
- 변경 사항은 Pull Request로 검토하며, 적용 전 관련 에이전트에게 알림
- 프롬프트 예시는 SPEC 변경사항과 동기화하고 `/tasks` 템플릿에 링크
- 잔여/폐기 프롬프트는 `archive/` 하위 디렉터리로 이동하여 히스토리 보존
