# 테스트 프레임워크 설정 가이드

이 문서는 백엔드 및 프론트엔드 서비스의 테스트 프레임워크 설정 방법을 설명합니다.

## 개요

이 프로젝트는 다음과 같은 테스트 프레임워크를 사용합니다:

- **백엔드**: Jest + @nestjs/testing (NestJS 표준 테스트 도구)
- **프론트엔드**: Vitest + React Testing Library
- **통합 테스트**: Jest (루트 레벨)

## 백엔드 테스트 설정

### 설치된 패키지

각 백엔드 서비스에 다음 패키지가 설치되어 있습니다:

- `jest`: 테스트 러너
- `@types/jest`: Jest TypeScript 타입 정의
- `ts-jest`: TypeScript 지원을 위한 Jest 프리셋
- `@nestjs/testing`: NestJS 테스트 유틸리티

### Jest 설정

각 서비스의 `jest.config.ts` 파일에는 다음 설정이 포함되어 있습니다:

- TypeScript 지원 (`ts-jest` 프리셋)
- 테스트 파일 매칭 (`**/*.spec.ts`, `**/*.test.ts`)
- 커버리지 수집 설정
- 모듈 경로 매핑 (`@schemas/*`)

### 테스트 스크립트

각 서비스의 `package.json`에 다음 스크립트가 추가되어 있습니다:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### 테스트 실행 방법

```bash
# 특정 서비스의 테스트 실행
cd backend/attendance-service
npm test

# Watch 모드로 실행
npm run test:watch

# 커버리지 리포트 생성
npm run test:coverage
```

### NestJS 테스트 예시

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeResolver } from './employee.resolver';

describe('EmployeeResolver', () => {
  let resolver: EmployeeResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeeResolver],
    }).compile();

    resolver = module.get<EmployeeResolver>(EmployeeResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
```

## 프론트엔드 테스트 설정

### 설치된 패키지

프론트엔드에 다음 패키지가 설치되어 있습니다:

- `vitest`: Vite 기반 테스트 러너
- `@vitest/ui`: Vitest UI 인터페이스
- `@testing-library/react`: React 컴포넌트 테스트 라이브러리
- `@testing-library/jest-dom`: DOM 매처 확장
- `@testing-library/user-event`: 사용자 이벤트 시뮬레이션
- `jsdom`: DOM 환경 시뮬레이션

### Vitest 설정

`frontend/vitest.config.ts` 파일에는 다음 설정이 포함되어 있습니다:

- React 플러그인 설정
- jsdom 환경 설정
- 테스트 setup 파일 설정
- 커버리지 설정
- 경로 별칭 설정

### 테스트 스크립트

프론트엔드 `package.json`에 다음 스크립트가 추가되어 있습니다:

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui"
  }
}
```

### 테스트 실행 방법

```bash
# 프론트엔드 디렉토리로 이동
cd frontend

# 테스트 실행
npm test

# Watch 모드로 실행
npm run test:watch

# 커버리지 리포트 생성
npm run test:coverage

# UI 모드로 실행
npm run test:ui
```

### React 컴포넌트 테스트 예시

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@shared/ui/Button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

## 공통 테스트 유틸리티

### 위치

공통 테스트 유틸리티는 `tests/utils/` 디렉토리에 있습니다:

- `test-helpers.ts`: 공통 테스트 헬퍼 함수
- `graphql-test-helpers.ts`: GraphQL 테스트 헬퍼 함수
- `mock-data.ts`: 공통 Mock 데이터

### 사용 예시

```typescript
import { createTestToken, createTestUserContext } from '../../../tests/utils/test-helpers';
import { mockEmployee, createMockEmployee } from '../../../tests/utils/mock-data';

// 테스트 토큰 생성
const token = createTestToken('user-123', 'HQ_ADMIN');

// Mock 데이터 사용
const employee = createMockEmployee({ name: '홍길동' });
```

## GraphQL 테스트

### Apollo Client Mock 설정

프론트엔드 테스트에서 Apollo Client를 Mock하기 위해 `MockedProvider`를 사용할 수 있습니다:

```typescript
import { MockedProvider } from '@apollo/client/testing';
import { render } from '@testing-library/react';

const mocks = [
  {
    request: {
      query: GET_EMPLOYEES,
      variables: { storeId: 'STORE-001' },
    },
    result: {
      data: {
        employees: [mockEmployee],
      },
    },
  },
];

render(
  <MockedProvider mocks={mocks}>
    <EmployeeList />
  </MockedProvider>
);
```

### Apollo Server Testing

백엔드 GraphQL 테스트는 Apollo Server Testing 라이브러리를 사용할 수 있습니다:

```typescript
import { createTestClient } from 'apollo-server-testing';
import { ApolloServer } from 'apollo-server-express';

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { query, mutate } = createTestClient(server);
```

## 테스트 커버리지

### 백엔드 커버리지

백엔드 서비스의 커버리지는 Jest의 기본 커버리지 도구를 사용합니다:

```bash
cd backend/attendance-service
npm run test:coverage
```

커버리지 리포트는 `coverage/` 디렉토리에 생성됩니다.

### 프론트엔드 커버리지

프론트엔드의 커버리지는 Vitest의 v8 provider를 사용합니다:

```bash
cd frontend
npm run test:coverage
```

## CI/CD 통합

GitHub Actions 워크플로에서 테스트가 자동으로 실행됩니다:

```yaml
- name: Run tests
  working-directory: backend/${{ matrix.service }}
  run: |
    if [ -f "package.json" ] && grep -q '"test"' package.json; then
      npm test || echo "Tests not implemented yet"
    else
      echo "No tests configured"
    fi
```

## 테스트 작성 가이드라인

### AAA 패턴

테스트는 Arrange, Act, Assert 패턴을 따릅니다:

```typescript
it('should create employee', () => {
  // Arrange: 테스트 데이터 준비
  const input = { name: '홍길동', email: 'hong@example.com' };
  
  // Act: 테스트 실행
  const result = resolver.createEmployee(input);
  
  // Assert: 결과 검증
  expect(result.name).toBe('홍길동');
});
```

### 테스트 명명 규칙

- `describe`: 테스트 그룹 설명
- `it`: 개별 테스트 케이스 설명
- 명확하고 구체적인 설명 사용

### Mock 사용

- 실제 데이터베이스 대신 Mock 데이터 사용
- 외부 서비스는 Mock으로 대체
- 테스트 간 독립성 보장

## 참고 자료

- [Jest 공식 문서](https://jestjs.io/)
- [Vitest 공식 문서](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Apollo Client Testing](https://www.apollographql.com/docs/react/development-testing/testing/)

