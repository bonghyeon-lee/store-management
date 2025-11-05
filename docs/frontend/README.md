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

## Apollo Client 설정

### 기본 구성

Apollo Client는 `src/app/providers/apollo.tsx`에 설정되어 있습니다:

- **HTTP Link**: GraphQL Gateway 엔드포인트 연결
  - 기본 URL: `http://localhost:4000/graphql`
  - 환경 변수: `VITE_GRAPHQL_ENDPOINT`로 설정 가능

- **Auth Link**: JWT 토큰을 자동으로 요청 헤더에 추가
  - `tokenStorage.getToken()`으로 토큰 조회
  - 토큰이 없으면 빈 문자열 전송

- **Error Link**: GraphQL 및 네트워크 에러 처리
  - `UNAUTHENTICATED` 또는 `TOKEN_EXPIRED` 에러 시 자동 로그아웃
  - 401 네트워크 에러 시 로그인 페이지로 리다이렉트

- **Retry Link**: 네트워크 에러 시 자동 재시도
  - 최대 3회 재시도
  - 5xx 서버 에러만 재시도 (4xx 클라이언트 에러는 재시도하지 않음)
  - 초기 지연 시간: 300ms, 지터(jitter) 적용

### 캐시 정책

- `InMemoryCache` 사용
- 기본 에러 정책: `errorPolicy: 'all'` (에러가 있어도 캐시된 데이터 반환)
- 필요 시 `typePolicies`로 필드별 캐시 정책 커스터마이징 가능

### 사용 예시

```typescript
import { useQuery } from '@apollo/client';
import { GET_EMPLOYEES } from '@shared/api/graphql/attendance.graphql';

function EmployeeList() {
  const { data, loading, error } = useQuery(GET_EMPLOYEES);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{/* ... */}</div>;
}
```

### 코드젠 설정

GraphQL Code Generator는 `codegen.ts`에 설정되어 있습니다:

```typescript
// codegen.ts
import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: ['../schemas/*.graphql'],
  documents: ['src/**/*.graphql'],
  generates: {
    'src/shared/api/generated/': {
      preset: 'client',
      plugins: []
    }
  }
};
```

코드젠 실행:

```bash
npm run codegen
```

생성된 타입과 훅은 `src/shared/api/generated/` 디렉터리에 위치합니다.

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

### GraphQL 쿼리/뮤테이션 테스트

Apollo Client의 `MockedProvider`를 사용하여 GraphQL 쿼리와 뮤테이션을 테스트합니다.

#### 테스트 유틸리티

`src/test/mock-apollo-client.tsx`에 테스트용 유틸리티가 포함되어 있습니다:

- `createMockQuery`: GraphQL 쿼리 Mock 생성
- `createMockMutation`: GraphQL 뮤테이션 Mock 생성
- `createMockError`: 에러 응답 Mock 생성
- `TestApolloProvider`: MockedProvider를 래핑한 테스트용 Provider

#### 테스트 예시

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { gql } from '@apollo/client';
import { TestApolloProvider, createMockQuery } from '@test/mock-apollo-client';
import { useQuery } from '@apollo/client';

const GET_EMPLOYEES = gql`
  query GetEmployees($storeId: ID) {
    employees(storeId: $storeId) {
      id
      name
      email
    }
  }
`;

function EmployeeList({ storeId }: { storeId?: string }) {
  const { data, loading, error } = useQuery(GET_EMPLOYEES, {
    variables: { storeId },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.employees.map((employee: any) => (
        <div key={employee.id}>{employee.name}</div>
      ))}
    </div>
  );
}

describe('EmployeeList', () => {
  it('should fetch and display employees', async () => {
    const mocks = [
      createMockQuery(
        GET_EMPLOYEES,
        { storeId: '1' },
        {
          employees: [
            { id: '1', name: '홍길동', email: 'hong@example.com' },
          ],
        }
      ),
    ];

    render(
      <TestApolloProvider mocks={mocks}>
        <EmployeeList storeId="1" />
      </TestApolloProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('홍길동')).toBeInTheDocument();
    });
  });
});
```

#### 테스트 실행

```bash
# 모든 테스트 실행
npm run test

# Watch 모드로 실행
npm run test:watch

# 커버리지 리포트 생성
npm run test:coverage

# 테스트 UI 실행
npm run test:ui
```

참고: 테스트 예시 파일은 `src/shared/api/graphql/__tests__/` 디렉터리에 있습니다.

## 환경 변수

프론트엔드에서 사용하는 환경 변수:

- `VITE_GRAPHQL_ENDPOINT`: GraphQL Gateway 엔드포인트 URL (기본값: `http://localhost:4000/graphql`)

`.env` 파일에 설정:

```env
VITE_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
```

## 개발 가이드

### 로컬 개발 환경 설정

1. **의존성 설치**

   ```bash
   cd frontend
   npm install
   ```

2. **개발 서버 실행**

   ```bash
   npm run dev
   ```

   - 기본 포트: `5173` (Vite)
   - 핫 리로드 지원

3. **코드젠 실행** (스키마 변경 시)

   ```bash
   npm run codegen
   ```

4. **빌드**

   ```bash
   npm run build
   ```

### GraphQL 쿼리 작성

1. `src/shared/api/graphql/` 디렉터리에 `.graphql` 파일 생성
2. 쿼리/뮤테이션 작성
3. `npm run codegen` 실행하여 타입 생성
4. 컴포넌트에서 생성된 훅 사용

예시:

```graphql
# src/shared/api/graphql/attendance.graphql
query GetEmployees($storeId: ID) {
  employees(storeId: $storeId) {
    id
    name
    email
    role
  }
}
```

```typescript
// 컴포넌트에서 사용
import { useQuery } from '@apollo/client';
import { GetEmployeesDocument } from '@shared/api/generated/gql';

function EmployeeList({ storeId }: { storeId: string }) {
  const { data, loading } = useQuery(GetEmployeesDocument, {
    variables: { storeId }
  });
  
  // ...
}
```

## 참고

- 요구사항: `../../SPEC.md`
- 관련 프롬프트: `../../prompts/frontend-wireframes.md` (작성 예정)
- 태스크 예시: `../../tasks/frontend/graphql-client.md`
- 백엔드 API 문서: `../backend/README.md`
