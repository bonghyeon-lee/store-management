# Backend Guidelines

## 서비스 구성

- 마이크로서비스는 NestJS + GraphQL(Federation Subgraph) 기반으로 구성
- 각 서비스는 독립 배포 가능 Docker 이미지와 Helm Chart를 가진다
- 주요 서비스
  - `attendance-service`
  - `inventory-service`
  - `sales-service`
  - `notification-service`
  - `auth-service`

## 공통 기술 스택

- NestJS 10, TypeScript, GraphQL Code First (TypeScript Decorators)
- ORM: Prisma (권장) 혹은 TypeORM
- Messaging: Kafka, BullMQ (백그라운드 작업)
- Observability: OpenTelemetry SDK, Winston 로깅

## 설계 패턴

- 입력 검증: DTO + Validation Pipe, class-validator
- CQRS + Event Sourcing(선택)으로 읽기/쓰기 분리
- 모듈화: Domain Module, Infrastructure Module, API Module
- Federation 키(`@key`) 설계 시 `storeId`, `employeeId` 등 전역 식별자 사용

## GraphQL 베스트 프랙티스

- 명령형 Mutation 이름 (`approveAttendance`, `reconcileInventory`)
- Federation Resolver에서 N+1 방지를 위해 DataLoader 적용
- Schema 변경은 Contract Test와 Schema Registry Diff 체크 필수
- Subscriptions는 Redis Pub/Sub 또는 Kafka 기반 어댑터 사용

## GraphQL Code First 방식

- 각 서비스는 TypeScript 데코레이터를 사용하여 GraphQL 스키마를 정의합니다
- 타입 정의는 `src/models/` 디렉터리에 위치합니다
- `@ObjectType()`, `@InputType()`, `@Field()` 등의 데코레이터를 사용합니다
- `autoSchemaFile` 옵션으로 스키마 파일이 자동 생성됩니다
- Federation 디렉티브는 `@Directive()` 데코레이터로 적용합니다

## Federation 설계 노트

### 스키마 생성 방식

- Subgraph 스키마는 Code First 방식으로 자동 생성됩니다 (`schema.gql`)
- 각 서비스의 `app.module.ts`에서 `ApolloFederationDriver`를 사용하여 Federation 2 지원
- `autoSchemaFile` 옵션으로 스키마 파일이 자동 생성됩니다

### Federation 키 전략

각 엔티티의 Federation 키 설계:

- **Employee** (Attendance 서비스): `@key(fields: "id")`
- **Attendance**: `@key(fields: "storeId employeeId date")`
- **Product** (Inventory 서비스): `@key(fields: "id")`
- **InventoryItem**: `@key(fields: "storeId sku")`
- **Order** (Sales 서비스): `@key(fields: "storeId orderId")`
- **User** (Auth 서비스): `@key(fields: "id")`
- **Notification**: `@key(fields: "id")`

### 필수 지침

1. **키 필드 설계**
   - 키 필드는 절대 nullable 하지 않음 (ID/날짜 등 전역 식별자)
   - 복합 키는 가능한 한 최소 필드로 구성
   - 교차 서비스 참조는 `@key`로 식별 가능한 엔티티만 사용

2. **서비스 간 의존성**
   - 교차 서비스 의존은 `@requires`/`@provides` 도입 전, 데이터 흐름/캐시 전략 먼저 확정
   - N+1 방지를 위해 각 키 조합에 대한 배치 로더 설계
   - DataLoader 패턴을 사용하여 서비스 간 조인 최적화

3. **스키마 버전 관리**
   - Breaking Change는 반드시 버전 업그레이드와 함께 진행
   - Schema Registry를 통해 변경 이력 추적
   - Contract Test 자동화로 호환성 검증

### Gateway 통합

- Gateway는 `IntrospectAndCompose`를 사용하여 모든 Subgraph를 자동으로 통합
- 각 Subgraph 서비스가 시작될 때까지 대기 (최대 60초)
- 통합 스키마는 Gateway의 `/graphql` 엔드포인트에서 제공

## Registry/Contract Test 절차

### GraphQL Inspector를 사용한 스키마 검증

프로젝트에는 GraphQL Inspector를 사용한 스키마 검증 스크립트가 포함되어 있습니다.

#### 1. 스키마 유효성 검증

모든 스키마 파일의 문법과 Federation 디렉티브를 검증합니다:

```bash
npm run schema:validate
```

이 명령은 다음을 확인합니다:
- 스키마 문법 유효성
- Federation 링크 존재 여부
- `@key` 디렉티브 사용 여부
- `@requires`, `@provides`, `@external` 디렉티브 사용 여부

#### 2. 스키마 변경사항 감지

두 스키마 파일 간의 변경사항을 분석하고 Breaking Change를 감지합니다:

```bash
npm run schema:diff -- schemas/attendance.graphql schemas/attendance.new.graphql
```

Breaking Change가 감지되면:
- 타입 제거
- 필드 제거
- 필수 필드 추가
- 타입 이름 변경

#### 3. Federation 통합 검증

모든 Subgraph 서비스가 정상적으로 연결되고 Federation 스키마가 올바르게 컴파일되는지 검증합니다:

```bash
npm run schema:verify
```

이 명령은 다음을 확인합니다:
- 각 Subgraph 서비스 헬스 체크
- 각 Subgraph 스키마 조회
- Gateway 헬스 체크
- Federation 통합 스키마 검증
- Federation 키 타입 확인

**참고**: 이 명령을 실행하려면 모든 서비스가 실행 중이어야 합니다.

### Apollo Rover CLI 사용 (선택사항)

Apollo Studio를 사용하는 경우 Apollo Rover CLI를 사용하여 스키마를 등록할 수 있습니다.

1. **Rover 로그인**
   ```bash
   rover config auth --key <APOLLO_KEY>
   ```

2. **Subgraph 등록**
   ```bash
   # Attendance 서비스
   rover subgraph publish store-management@current \
     --name attendance \
     --schema schemas/attendance.graphql \
     --routing-url http://localhost:4001/graphql
   
   # Inventory 서비스
   rover subgraph publish store-management@current \
     --name inventory \
     --schema schemas/inventory.graphql \
     --routing-url http://localhost:4002/graphql
   
   # Sales 서비스
   rover subgraph publish store-management@current \
     --name sales \
     --schema schemas/sales.graphql \
     --routing-url http://localhost:4003/graphql
   
   # Auth 서비스
   rover subgraph publish store-management@current \
     --name auth \
     --schema schemas/auth.graphql \
     --routing-url http://localhost:4005/graphql
   
   # Notification 서비스
   rover subgraph publish store-management@current \
     --name notification \
     --schema schemas/notification.graphql \
     --routing-url http://localhost:4004/graphql
   ```

3. **Supergraph 구성 다운로드**
   ```bash
   rover supergraph compose --config rover-config.yaml
   ```

### CI/CD 통합

스키마 검증은 CI/CD 파이프라인에 통합되어 있습니다:

```yaml
# .github/workflows/ci.yml 예시
- name: Validate GraphQL Schemas
  run: npm run schema:validate

- name: Verify Federation Integration
  run: npm run schema:verify
```

### Gateway 통합 테스트

1. 모든 Subgraph 서비스가 실행 중인지 확인
2. Gateway 서비스가 모든 Subgraph를 인식하는지 확인
3. 통합 스키마가 올바르게 생성되는지 확인
4. GraphQL Playground에서 쿼리 테스트 수행

## 로컬 실행 가이드 (Subgraphs)

### 서비스별 실행 포트

| 서비스       | 포트 | GraphQL 엔드포인트            |
| ------------ | ---- | ----------------------------- |
| Gateway      | 4000 | http://localhost:4000/graphql |
| Attendance   | 4001 | http://localhost:4001/graphql |
| Inventory    | 4002 | http://localhost:4002/graphql |
| Sales        | 4003 | http://localhost:4003/graphql |
| Notification | 4004 | http://localhost:4004/graphql |
| Auth         | 4005 | http://localhost:4005/graphql |

### 서비스 실행 절차

1. **각 서비스 디렉터리에서 의존성 설치 및 실행**
   ```bash
   # Attendance 서비스
   cd backend/attendance-service
   npm install
   npm run start:dev
   
   # Inventory 서비스
   cd backend/inventory-service
   npm install
   npm run start:dev
   
   # Sales 서비스
   cd backend/sales-service
   npm install
   npm run start:dev
   
   # Notification 서비스
   cd backend/notification-service
   npm install
   npm run start:dev
   
   # Auth 서비스
   cd backend/auth-service
   npm install
   npm run start:dev
   ```

2. **Gateway 서비스 실행**
   ```bash
   cd backend/gateway-service
   npm install
   npm run start:dev
   ```
   
   Gateway는 모든 Subgraph 서비스가 시작될 때까지 대기합니다 (최대 60초).

3. **스키마 생성 확인**
   - 각 서비스 실행 후 `schema.gql` 파일이 자동 생성됩니다
   - Code First 방식: TypeScript 데코레이터로 스키마를 정의하고 `autoSchemaFile`로 자동 생성
   - 참고: 실제 데이터 연동 전까지 Resolver는 목 구현으로 동작합니다

### Docker Compose를 사용한 실행

프로젝트 루트에서 다음 명령어로 모든 서비스를 한 번에 실행할 수 있습니다:

```bash
# 개발 환경 (핫 리로드)
docker-compose -f docker-compose.dev.yml up

# 프로덕션 환경
docker-compose up
```

### Federation 스키마 파일 위치

각 서비스의 스키마는 다음 위치에 있습니다:
- `schemas/attendance.graphql` - Attendance 서비스 스키마 (SDL)
- `schemas/inventory.graphql` - Inventory 서비스 스키마 (SDL)
- `schemas/sales.graphql` - Sales 서비스 스키마 (SDL)
- `schemas/auth.graphql` - Auth 서비스 스키마 (SDL)
- `schemas/notification.graphql` - Notification 서비스 스키마 (SDL)

각 서비스 디렉터리의 `schema.gql` 파일은 Code First 방식으로 자동 생성된 Federation 스키마입니다.

### Federation 디렉티브 추가 방법

NestJS Code First 방식에서 Federation 디렉티브를 추가하려면 `@Directive()` 데코레이터를 사용합니다:

```typescript
import { ObjectType, Field, ID, Directive } from '@nestjs/graphql';

@ObjectType()
@Directive('@key(fields: "id")')
export class Employee {
  @Field(() => ID)
  id!: string;
  
  // ... 다른 필드들
}
```

현재는 Code First 방식으로 자동 생성되지만, Federation 디렉티브는 별도로 추가해야 합니다 (향후 작업 예정).

## 데이터 관리

- 트랜잭션: PostgreSQL, Prisma Transaction API
- 배치 작업: Temporal 혹은 Nest Schedule 모듈
- 감사 로그: PostgreSQL 파티셔닝 + S3 백업
- 시계열 데이터: TimescaleDB Continuous Aggregate

## 테스트

- 유닛: Jest + Testing Module
- 통합: Supertest + GraphQL E2E
- 계약: GraphQL Inspector, Apollo Rover CLI
- 로드: k6, Artillery로 부하 테스트

## 참고

- 아키텍처: `../architecture/overview.md`
- 워크플로: `../../workflows/README.md`
- 태스크: `../../tasks/backend/federation-schema.md`
