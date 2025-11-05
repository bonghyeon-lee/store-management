# 스키마 버전 관리 전략

## 개요

GraphQL Federation 환경에서 스키마 변경을 안전하게 관리하기 위한 전략입니다.

## 버전 관리 원칙

### Breaking Change

다음과 같은 변경은 **Breaking Change**로 간주됩니다:

1. **타입 제거**: 타입이나 필드를 완전히 제거
2. **필드 타입 변경**: 필드의 타입을 변경 (예: `String` → `Int`)
3. **필수 필드 추가**: 선택적 필드(`nullable: true`)를 필수 필드로 변경
4. **Federation 키 변경**: `@key` 디렉티브의 필드 변경
5. **Enum 값 제거**: Enum에서 값 제거
6. **Input 필드 필수화**: Input 타입의 필드를 필수로 변경

### Non-Breaking Change

다음과 같은 변경은 **Non-Breaking Change**로 간주됩니다:

1. **필드 추가**: 새로운 필드를 추가 (기본적으로 `nullable: true`)
2. **선택적 필드 추가**: 선택적 필드 추가
3. **타입 확장**: Union 타입에 새로운 타입 추가
4. **Enum 값 추가**: Enum에 새로운 값 추가
5. **주석/설명 추가**: 필드나 타입에 설명 추가

## 버전 관리 전략

### 1. 스키마 변경 프로세스

1. **변경 계획 수립**
   - Breaking Change 여부 확인
   - 영향 범위 분석
   - 마이그레이션 계획 수립

2. **로컬 검증**
   - 스키마 컴파일 확인
   - Contract 테스트 실행
   - 통합 테스트 실행

3. **PR 생성 및 리뷰**
   - Breaking Change는 반드시 문서화
   - 영향받는 서비스 확인
   - 마이그레이션 가이드 작성

4. **CI/CD 검증**
   - 자동 스키마 검증
   - Contract 테스트 실행
   - 통합 테스트 실행

5. **배포**
   - 단계적 배포 (서비스별 순차 배포)
   - 모니터링 및 롤백 계획

### 2. Contract 테스트

각 서비스의 스키마 변경 시 Contract 테스트를 실행하여 다른 서비스와의 호환성을 확인합니다.

**위치**: `tests/federation-integration.test.ts`

**실행 방법**:
```bash
npm run test:federation
```

### 3. 스키마 검증 도구

#### Apollo Rover CLI (향후 도입)

Apollo Rover CLI를 사용하여 스키마 검증:

```bash
# 설치
npm install -g @apollo/rover

# 스키마 검증
rover subgraph check my-graph@production \
  --schema ./backend/attendance-service/schema.gql \
  --name attendance
```

#### GraphQL Inspector (향후 도입)

GraphQL Inspector를 사용하여 Breaking Change 감지:

```bash
# 설치
npm install -g @graphql-inspector/cli

# Breaking Change 감지
graphql-inspector diff \
  ./backend/attendance-service/schema.gql \
  ./backend/attendance-service/schema.gql.bak
```

### 4. 스키마 레지스트리 (향후)

스키마 레지스트리를 도입하여 스키마 버전을 중앙 관리:

- **Apollo Studio**: 스키마 버전 관리 및 검증
- **Schema Registry**: 커스텀 스키마 레지스트리 구축

## CI/CD 통합

### GitHub Actions 워크플로우

현재 CI/CD 파이프라인에는 다음 검증 단계가 포함되어 있습니다:

1. **Federation 통합 테스트**: `integration-test` job
   - 모든 서비스 시작
   - Federation 스키마 통합 검증
   - 서비스 간 데이터 조인 테스트

2. **Contract 테스트**: `federation-integration.test.ts`
   - 스키마 Introspection
   - 타입 존재 확인
   - 서비스 간 조인 동작 확인

### 향후 개선 사항

1. **자동 Breaking Change 감지**
   - PR 생성 시 자동으로 Breaking Change 감지
   - Breaking Change 감지 시 리뷰어 알림

2. **스키마 비교 도구 통합**
   - Apollo Rover CLI 통합
   - GraphQL Inspector 통합

3. **스키마 레지스트리 연동**
   - Apollo Studio 연동
   - 스키마 버전 자동 등록

## 마이그레이션 가이드

### Breaking Change 마이그레이션 예시

**시나리오**: `Employee` 타입의 `email` 필드를 필수에서 선택적으로 변경

1. **1단계**: 필드를 선택적으로 변경
   ```typescript
   @Field({ nullable: true })
   email?: string;
   ```

2. **2단계**: 기존 코드에서 `email` 사용처 확인
3. **3단계**: 필수 사용처에 기본값 또는 처리 로직 추가
4. **4단계**: Contract 테스트 업데이트
5. **5단계**: 배포 및 모니터링

## 모니터링

### 스키마 변경 추적

- **Git 히스토리**: 스키마 파일 변경 이력 추적
- **CI/CD 로그**: 스키마 검증 결과 로깅
- **Apollo Studio**: 스키마 변경 그래프 (향후)

### 알림

- Breaking Change 감지 시 Slack/이메일 알림
- 스키마 컴파일 실패 시 알림
- Contract 테스트 실패 시 알림

## 참고 자료

- [Apollo Federation 버전 관리](https://www.apollographql.com/docs/federation/managing-supergraphs/)
- [GraphQL 스키마 진화 가이드](https://graphql.org/learn/best-practices/#versioning)
- [Contract Testing Best Practices](https://www.thoughtworks.com/insights/blog/contract-testing-microservices)

