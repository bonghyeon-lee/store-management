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

## Feature-Sliced Design (FSD)

- **채택 레이어**: `app` → `pages` → `widgets` → `features` → `entities` → `shared`
- **의존성 방향**: 상위 레이어가 하위 레이어에만 의존 가능. 역참조 금지.
- **슬라이스 구조(권장)**:
  - `model/`: 상태, 비즈니스 로직(RTK slice, hooks, selectors)
  - `ui/`: 프리젠테이션 컴포넌트
  - `lib/`: 순수 유틸, 도메인 헬퍼
  - `api/`: 해당 슬라이스 전용 GraphQL 쿼리/뮤테이션, 코드젠 결과
  - `index.ts`: 퍼블릭 API(외부에 노출할 것만 export)
- **임포트 규칙**:
  - 외부에서 슬라이스 내부 파일 직접 임포트 금지. 항상 `features/<slice>`의 퍼블릭 API를 통해 접근
  - 예: `import { AdjustInventoryButton } from "features/inventory";`
  - 레이어 간 교차는 상위→하위만 허용(`pages`가 `features` 사용 가능, 반대는 불가)

예시(인벤토리 슬라이스):

```text
src/
  features/
    inventory/
      model/
        inventorySlice.ts
        selectors.ts
      ui/
        AdjustInventoryButton.tsx
      api/
        inventory.graphql
        __generated__/ (codegen output)
      lib/
        formatters.ts
      index.ts
```

페이지 조합 예시:

```text
src/
  pages/
    InventoryPage/
      ui/
        InventoryPage.tsx   (widgets/features 조합)
      index.ts
```

## GraphQL 연동 원칙

- 코드젠(GraphQL Code Generator)으로 타입/훅 생성
- 쿼리/뮤테이션/서브스크립션은 가능하면 슬라이스에 **공동배치(co-location)**: `features/<slice>/api`
- 여러 슬라이스에서 재사용되는 공용 스키마 조각(fragment)/유틸만 `shared/graphql`에 배치
- 에러 처리: Global Error Boundary + Apollo Link 에러 핸들링
- Optimistic UI는 재고 조정, 근태 승인 등 즉시 피드백이 필요한 액션에 적용

## ESLint Import Boundaries 예시

FSD 레이어 간 의존 방향을 ESLint로 강제합니다. 예시는 `eslint-plugin-boundaries` 기반입니다.

```js
// .eslintrc.cjs
module.exports = {
  plugins: ["boundaries", "import"],
  settings: {
    "boundaries/elements": [
      { type: "app", pattern: "src/app/**" },
      { type: "pages", pattern: "src/pages/**" },
      { type: "widgets", pattern: "src/widgets/**" },
      { type: "features", pattern: "src/features/*/**" },
      { type: "entities", pattern: "src/entities/*/**" },
      { type: "shared", pattern: "src/shared/**" }
    ]
  },
  rules: {
    // 상위 → 하위만 허용 (역참조 금지)
    "boundaries/element-types": [
      "error",
      {
        default: "disallow",
        rules: [
          { from: "app", allow: ["pages", "widgets", "features", "entities", "shared"] },
          { from: "pages", allow: ["widgets", "features", "entities", "shared"] },
          { from: "widgets", allow: ["features", "entities", "shared"] },
          { from: "features", allow: ["entities", "shared"] },
          { from: "entities", allow: ["shared"] },
          { from: "shared", disallow: ["app", "pages", "widgets", "features", "entities"] }
        ]
      }
    ],

    // 퍼블릭 API(각 슬라이스의 index.ts)만 임포트 허용
    "import/no-internal-modules": [
      "error",
      {
        forbid: [
          {
            pattern: "src/(features|entities)/*/**",
            // 예외: 퍼블릭 API 경로만 허용 (index)
            // 특정 하위 경로나 shared 유틸 등은 필요 시 allow로 열어둘 수 있음
          }
        ],
        allow: [
          "src/features/*",
          "src/entities/*",
          "src/shared/**",
          "src/app/**",
          "src/pages/**",
          "src/widgets/**"
        ]
      }
    ]
  }
};
```

## tsconfig Path Alias 예시

FSD 폴더를 별칭으로 매핑해 임포트 가독성과 경계 규칙을 보조합니다.

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@app/*": ["app/*"],
      "@pages/*": ["pages/*"],
      "@widgets/*": ["widgets/*"],
      "@features/*": ["features/*"],
      "@entities/*": ["entities/*"],
      "@shared/*": ["shared/*"]
    }
  }
}
```

사용 예시:

```ts
// 상위 → 하위 의존만 허용되는 예
import { InventoryPage } from "@pages/InventoryPage";
import { AdjustInventoryButton } from "@features/inventory"; // features/inventory/index.ts
import { ProductCard } from "@entities/product"; // entities/product/index.ts
import { formatCurrency } from "@shared/lib/format";
```

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
