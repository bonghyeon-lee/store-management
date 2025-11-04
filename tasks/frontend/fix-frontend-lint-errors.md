---
title: "[Frontend] GitHub Actions Frontend Lint 에러 수정"
owner: frontend-dev
status: completed
priority: high
due: 2025-11-05
related_tasks:
  - ./graphql-client.md
---

## 문제 분석

GitHub Actions의 Frontend Build & Test 단계에서 lint 에러로 인해 실패했습니다.

**실행 ID**: [19073784556](https://github.com/bonghyeon-lee/store-management/actions/runs/19073784556/job/54483535235)

### 주요 에러

1. **모듈 경로 해석 실패**
   - `Unable to resolve path to module '@app/providers/apollo'`
   - `Unable to resolve path to module '@apollo/client'`
   - `Unable to resolve path to module 'react'`
   - TypeScript 경로 별칭(`@app`, `@pages`, `@shared` 등)을 ESLint가 해석하지 못함

2. **Import 정렬 문제**
   - `Run autofix to sort these imports!` 에러 다수 발생
   - `simple-import-sort` 규칙 위반

3. **TypeScript Resolver 에러**
   - `typescript with invalid interface loaded as resolver` 에러
   - `eslint-import-resolver-typescript` 패키지가 설치되지 않음

4. **코드 품질 에러**
   - 사용하지 않는 변수들 (`useEffect`, `data`, `operation`, `forward`, `status`, `setStatus`, `err`, `error`, `apolloClient`, `LOGIN_MUTATION`, `formatDate`)
   - 불필요한 이스케이프 문자 (`\/` → `/`)
   - `any` 타입 사용

## 해결 방안

### 1. 패키지 의존성 추가

**파일**: `frontend/package.json`

```json
{
  "devDependencies": {
    "eslint-import-resolver-typescript": "^3.6.1"
  }
}
```

- TypeScript 경로 별칭을 ESLint가 올바르게 해석할 수 있도록 resolver 패키지 추가

### 2. ESLint 설정 개선

**파일**: `frontend/.eslintrc.cjs`

```javascript
settings: {
  react: { version: 'detect' },
  'import/resolver': {
    typescript: {
      alwaysTryTypes: true,  // 추가
      project: './tsconfig.json',
    },
    node: {  // 추가
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
  },
},
```

- `alwaysTryTypes: true` 옵션으로 TypeScript 타입 정의 파일도 확인
- Node resolver 추가로 일반 모듈 경로도 지원

### 3. Import 정렬 자동 수정

ESLint의 `--fix` 옵션을 사용하여 모든 파일의 import를 자동 정렬:

```bash
npm run lint -- --fix
```

정렬 규칙:

- 외부 라이브러리 import (`react`, `@apollo/client` 등)
- 빈 줄
- 내부 경로 별칭 import (`@app`, `@pages`, `@shared` 등)

### 4. 코드 품질 에러 수정

#### 4.1 사용하지 않는 변수 제거

- `frontend/src/pages/employees/ui/EmployeeFormPage.tsx`:
  - `useEffect` import 제거
  - `data` 변수 제거 (onCompleted에서 직접 사용)

- `frontend/src/pages/employees/ui/EmployeeListPage.tsx`:
  - `status`, `setStatus` 제거
  - `err` 변수를 catch 블록에서 제거

- `frontend/src/app/providers/apollo.tsx`:
  - `operation`, `forward` 파라미터 제거

- `frontend/src/pages/login/ui/LoginPage.tsx`:
  - `apolloClient`, `LOGIN_MUTATION` 제거 (사용하지 않음)

- `frontend/src/shared/lib/auth/auth-context.tsx`:
  - `error` 변수 제거

- `frontend/src/shared/ui/DatePicker.tsx`:
  - `formatDate` import 제거

#### 4.2 정규식 이스케이프 문자 수정

**파일**: `frontend/src/app/index.tsx`

```typescript
// 수정 전
const employeeMatch = path.match(/^\/employees\/([^\/]+)$/);
const employeeEditMatch = path.match(/^\/employees\/([^\/]+)\/edit$/);

// 수정 후
const employeeMatch = path.match(/^\/employees\/([^/]+)$/);
const employeeEditMatch = path.match(/^\/employees\/([^/]+)\/edit$/);
```

#### 4.3 타입 수정

**파일**: `frontend/src/pages/home/ui/HomePage.tsx`

```typescript
// 수정 전
useQuery<{ products: any[] }>(ProductsQuery, ...)

// 수정 후
useQuery<{ products: Product[] }>(ProductsQuery, ...)
```

## 수정된 파일 목록

### 패키지 및 설정 파일

- `frontend/package.json` - `eslint-import-resolver-typescript` 추가
- `frontend/.eslintrc.cjs` - TypeScript resolver 설정 개선

### 소스 코드 파일

- `frontend/src/app/index.tsx` - Import 정렬, 정규식 수정
- `frontend/src/app/providers/apollo.tsx` - Import 정렬, 사용하지 않는 변수 제거
- `frontend/src/main.tsx` - Import 정렬
- `frontend/src/features/add-to-cart/ui/AddToCartButton.tsx` - Import 정렬
- `frontend/src/pages/employees/ui/EmployeeFormPage.tsx` - Import 정렬, 사용하지 않는 변수 제거
- `frontend/src/pages/employees/ui/EmployeeListPage.tsx` - Import 정렬, 사용하지 않는 변수 제거
- `frontend/src/pages/home/ui/HomePage.tsx` - Import 정렬, 타입 수정
- `frontend/src/pages/login/ui/LoginPage.tsx` - Import 정렬, 사용하지 않는 변수 제거
- `frontend/src/shared/lib/auth/auth-context.tsx` - Import 정렬, 사용하지 않는 변수 제거
- `frontend/src/shared/ui/DatePicker.tsx` - Import 정렬, 사용하지 않는 import 제거

## 작업 항목

### [x] 1. 패키지 의존성 추가

- [x] `eslint-import-resolver-typescript` 패키지 추가
- [x] `npm install` 실행

### [x] 2. ESLint 설정 개선

- [x] TypeScript resolver에 `alwaysTryTypes: true` 추가
- [x] Node resolver 추가

### [x] 3. Import 정렬 수정

- [x] ESLint `--fix` 옵션으로 자동 정렬
- [x] 모든 파일의 import 순서 확인

### [x] 4. 코드 품질 에러 수정

- [x] 사용하지 않는 변수 제거
- [x] 불필요한 이스케이프 문자 제거
- [x] `any` 타입을 구체적 타입으로 변경
- [x] 사용하지 않는 import 제거

### [x] 5. 검증

- [x] 로컬에서 `npm run lint` 실행하여 모든 에러 해결 확인

## 예상 결과

수정 후 다음이 성공해야 함:

- ✅ Frontend Build & Test 단계에서 lint 통과
- ✅ 모든 import가 올바르게 정렬됨
- ✅ TypeScript 경로 별칭이 올바르게 해석됨
- ✅ 코드 품질 에러 없음

## 참고 사항

- `simple-import-sort` 플러그인은 외부 라이브러리와 내부 경로 별칭 사이에 빈 줄을 요구함
- `eslint-import-resolver-typescript`는 `tsconfig.json`의 `paths` 설정을 읽어서 경로 별칭을 해석함
- `--max-warnings=0` 옵션으로 인해 경고도 실패로 처리되므로 모든 경고를 해결해야 함
