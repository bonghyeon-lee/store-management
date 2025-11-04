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

- NestJS 10, TypeScript, GraphQL Code First + Schema Registry
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

## Federation 설계 노트

- Subgraph 스키마 위치: `schemas/attendance.graphql`, `schemas/inventory.graphql`, `schemas/sales.graphql`
- 키 전략
  - Attendance: `@key(fields: "storeId employeeId date")`
  - InventoryItem: `@key(fields: "storeId sku")`
  - Order: `@key(fields: "storeId orderId")`
- 필수 지침
  - 키 필드는 절대 nullable 하지 않음(ID/날짜 등 전역 식별자)
  - 교차 서비스 의존은 `@requires`/`@provides` 도입 전, 데이터 흐름/캐시 전략 먼저 확정
  - N+1 방지를 위해 각 키 조합에 대한 배치 로더 설계

## Registry/Contract Test 절차

1. Rover 로그인: `rover config auth --key <APOLLO_KEY>`
2. Subgraph 등록 예시:
   - Attendance: `rover subgraph publish store-management@current --name attendance --schema schemas/attendance.graphql`
   - Inventory: `rover subgraph publish store-management@current --name inventory --schema schemas/inventory.graphql`
   - Sales: `rover subgraph publish store-management@current --name sales --schema schemas/sales.graphql`
3. 계약 테스트(GraphQL Inspector): `graphql-inspector diff schema-old.graphql schema-new.graphql`
4. 게이트웨이 로컬 통합 후 스모크 테스트 진행

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
