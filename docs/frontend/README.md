# Frontend Guidelines

## 기술 스택

- React 18 + TypeScript
- Vite 빌드, Vitest + React Testing Library
- Apollo Client 3, Redux Toolkit Query (캐싱 및 상태 분리)
- MUI 디자인 시스템 + Storybook

## 프로젝트 구조 (제안)

```text
frontend/
  src/
    app/
    features/
      attendance/
      inventory/
      sales/
    shared/
      components/
      hooks/
      utils/
      graphql/
    pages/
    router/
    store/
```

## GraphQL 연동 원칙

- 코드젠(GraphQL Code Generator)으로 타입/훅 생성
- 쿼리/뮤테이션/서브스크립션 정의는 `shared/graphql` 아래 모듈화
- 에러 처리: Global Error Boundary + Apollo Link 에러 핸들링
- Optimistic UI는 재고 조정, 근태 승인 등 즉시 피드백이 필요한 액션에 적용

## 상태 관리 가이드

- GraphQL 캐시에 적합하지 않은 로컬/뷰 상태는 RTK Slice로 별도 관리
- Form 상태는 React Hook Form 사용, Zod 기반 Validation
- 다국어 지원(i18next)과 접근성(ARIA) 규칙 준수

## 테스트 전략

- Vitest로 유닛 테스트, Storybook Interaction Test로 컴포넌트 검증
- Playwright/Cypress로 주요 플로우 E2E 테스트
- Lighthouse CI로 성능/접근성 CI 단계 측정

## 참고

- 요구사항: `../../SPEC.md`
- 관련 프롬프트: `../../prompts/frontend-wireframes.md` (작성 예정)
- 태스크 예시: `../../tasks/frontend/graphql-client.md`
