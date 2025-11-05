# Store Management Platform SPEC

## 제품 개요

- 목표: 다점포 환경에서 근태, 재고, 매출을 통합 관리하는 SaaS형 상점 운영 플랫폼
- 타깃 사용자: 본사 운영 관리자, 지점 점장, 현장 직원
- 주요 가치: 실시간 데이터 동기화, 자동화된 근태 검증, 수요 기반 재고 추천, 매출 인사이트 대시보드

## 사용자 페르소나

- **HQ 운영 관리자**: 모든 지점의 KPI와 이슈를 모니터링하고 정책을 배포
- **지점 점장**: 매장별 근태 승인, 재고 발주, 일별 매출 점검 및 개선 액션 수행
- **현장 직원**: 모바일 앱으로 출퇴근 기록, 재고 실사 입력, 판매 프로모션 진행

## 페르소나별 사용자 여정

### HQ 운영 관리자 여정

1. **일일 모니터링 시작**
   - 로그인 후 전체 지점 KPI 대시보드 확인
   - 이상 징후 알림(무단결근, 재고 부족, 매출 급감) 검토
   - 각 지점별 상태 요약 확인

2. **이슈 대응 및 정책 배포**
   - 특정 지점의 근태/재고/매출 이슈 상세 조사
   - 정책 변경사항 적용 (예: 근태 승인 규칙, 재고 임계치 조정)
   - 변경 이력 추적 및 감사 로그 확인

3. **주간/월간 리포트 검토**
   - 집계된 매출/재고/근태 트렌드 분석
   - 지점 간 비교 분석 및 벤치마킹
   - 상위 관리층 보고용 리포트 생성

### 지점 점장 여정

1. **출근 후 일일 점검**
   - 직원 근태 승인 요청 확인 및 승인/거부
   - 전일 매출 데이터 검토 및 이상 확인
   - 재고 상태 확인 및 발주 필요 품목 검토

2. **근태 관리**
   - 스케줄 확인 및 교대 조정
   - 출퇴근 기록 검증 (GPS/비콘 기반)
   - 초과근무 승인 처리

3. **재고 관리**
   - 재고 실사 결과 입력 및 검증
   - 리오더 추천 품목 검토 및 발주 승인
   - 입고 확인 및 재고 업데이트

4. **매출 분석 및 개선**
   - 실시간 매출 대시보드 모니터링
   - 프로모션 효과 분석
   - 일별/주별 성과 리포트 검토 및 개선 액션 계획

### 현장 직원 여정

1. **출퇴근 기록**
   - 모바일 앱으로 출근 시 GPS/비콘 기반 체크인
   - 퇴근 시 체크아웃 및 근무 시간 확인
   - 근태 승인 대기 상태 확인

2. **재고 실사**
   - 모바일 앱으로 재고 실사 입력
   - 스캔 또는 수동 입력으로 재고량 기록
   - 실사 완료 후 제출

3. **판매 활동**
   - 프로모션 정보 확인 및 적용
   - 판매 데이터 입력 (필요 시)
   - 고객 이벤트 기록

## 핵심 시나리오

1. 점장이 모바일 앱으로 직원 근태를 승인하면 GraphQL Mutation을 통해 Attendance 서비스에 기록
2. 재고 실사 결과를 업로드하면 Inventory 서비스가 임계치 이하 품목에 대해 리오더 추천 생성
3. POS 매출 데이터가 Sales 서비스로 스트리밍되어 일/주/월별 성과 대시보드 업데이트
4. 이상 징후(무단결근, 재고 부족, 매출 급감)가 감지되면 Notification 서비스가 슬랙/메일 알림 발송

## 아키텍처 개요

- **클라이언트**: React + TypeScript, Apollo Client, Redux Toolkit Query, MUI 기반 관리자/점장/직원 포털
- **BFF**: Apollo Federation Gateway (NestJS), 인증/인가 미들웨어와 Observability 인터셉터 포함
- **마이크로서비스**: NestJS 기반 Attendance, Inventory, Sales, Notification, Auth 서비스 (각각 GraphQL Subgraph 제공)
- **데이터 계층**: PostgreSQL (OLTP), Redis 캐시/세션, TimescaleDB 또는 ClickHouse(매출 시계열), S3 호환 객체 스토리지(문서/엑셀)
- **인프라**: Kubernetes, Helm, Argo CD, OpenTelemetry, Prometheus/Grafana, Elastic Stack
- **CI/CD**: GitHub Actions → Docker Build → Argo CD Sync, 테스트 단계에서 Cypress/E2E 및 Contract 테스트

## 서비스 상세

- **Attendance**: 근태 스케줄/교대 관리, GPS/비콘 기반 출퇴근 검증, 초과근무 승인 워크플로
- **Inventory**: SKU 관리, 실사 입력, 발주/입고 처리, 안전재고 계산, 외부 POS 연동
- **Sales**: 매출 집계, 프로모션 분석, 예측 모델 연결(추후), KPI 대시보드용 데이터 가공
- **Notification**: 이벤트 라우팅, 템플릿 관리, 다중 채널(슬랙, 이메일, SMS) 발송
- **Auth**: Keycloak 또는 Cognito 연동, RBAC/ABAC, 감사 로그

## GraphQL 설계 원칙

- Federation으로 서비스별 Schema를 독립 관리하며, Gateway에서 통합
- Mutation은 명령성 이름(`approveAttendance`, `submitInventoryCount`, `recordSalesBatch`) 사용
- 중요 필드는 Input/Output 타입으로 명확히 분리하고 Validation Pipe 적용
- Subscription으로 실시간 재고 변화, 근태 승인 상태를 WebSocket 전달
- N+1 방지를 위해 DataLoader 패턴과 캐시 헤더(Cache-Control) 전략 적용

## 데이터 모델 (요약)

- `Employee`: id, role, employmentStatus, assignedStoreIds
- `AttendanceRecord`: employeeId, shiftId, checkIn/out, status, geoFenceId
- `InventoryItem`: skuId, storeId, quantityOnHand, reorderPoint, lastAuditAt
- `SalesOrder`: orderId, storeId, totalAmount, channel, settledAt
- `Alert`: type, severity, payload, acknowledgedBy, createdAt

## 보안 및 규정 준수

- OIDC 기반 SSO, JWT Access Token + Refresh Token
- Field Level Authorization (직급별 데이터 접근 제한)
- 감사 로그 저장 및 1년 보관, 변경 이력 추적
- PII 데이터 암호화, 데이터 마스킹 적용

## 관측 가능성 및 운영

- 각 서비스는 OpenTelemetry tracing + structured logging
- SLO: GraphQL p95 응답 300ms 이하, 월별 가용성 99.9%
- 로그 기반 알람, 메트릭 기반 자동 스케일링(HPA)
- Feature Flag 서비스 도입(LaunchDarkly 혹은 OpenFeature)

## MVP 스코프

### M0 (MVP - 최소 기능 제품)

#### 근태 서비스

- 직원 기본 정보 관리 (CRUD)
- 출퇴근 기록 입력 및 조회
- 근태 승인 워크플로 (점장 승인)
- 간단한 근태 리포트 (일별/주별)

#### 재고 서비스

- SKU 기본 정보 관리
- 재고 실사 입력 및 조회
- 안전재고 임계치 설정 및 리오더 추천
- 발주 요청 및 입고 처리 기본 기능

#### 매출 서비스

- 매출 데이터 입력 및 조회
- 일별/주별/월별 매출 집계
- 기본 매출 대시보드 (지점별, 기간별)

#### 알림 서비스

- 이벤트 기반 알림 발송 (이메일)
- 알림 템플릿 관리
- 알림 이력 조회

#### 인증/인가

- 기본 사용자 인증 (JWT)
- 역할 기반 접근 제어 (RBAC)
- HQ 관리자 / 점장 / 직원 권한 분리

#### 프론트엔드

- 관리자 대시보드 (React)
- 점장 포털 (React)
- 직원 모바일 앱 또는 PWA 기본 기능

#### 인프라

- 기본 CI/CD 파이프라인 (GitHub Actions)
- Docker 컨테이너화
- 로컬 개발 환경 설정

### M0 제외 기능 (향후 버전)

- GPS/비콘 기반 자동 출퇴근 검증 (M1)
- 실시간 Subscription (M1)
- 외부 POS/ERP 통합 (M2)
- AI 기반 수요 예측 (M3)
- 자동 스케줄링 (M3)
- 다중 채널 알림 (슬랙, SMS) (M1)
- 고급 분석 및 예측 모델 (M2+)

## 로드맵 (상세)

- **M0 (MVP)**: 핵심 근태/재고/매출 조회 + 기본 알람 + 기본 인증
  - 목표: 핵심 기능 검증 및 초기 사용자 피드백 수집
  - 기간: 8-12주
  
- **M1**: 모바일 근태 검증, 재고 리오더 추천, KPI 대시보드, 실시간 알림
  - 목표: 운영 효율성 향상 및 자동화
  - 기간: 6-8주

- **M2**: 외부 ERP/POS 통합, 예측 모델, 커스텀 리포트, 고급 분석
  - 목표: 데이터 통합 및 인사이트 제공
  - 기간: 8-10주

- **M3**: AI 기반 수요 예측, 자동 스케줄링, 멀티 국가 지원, 고급 최적화
  - 목표: 지능형 자동화 및 확장성
  - 기간: 10-12주

## 리스크 및 완화 전략

### 기술적 리스크

1. **서비스 간 GraphQL 스키마 드리프트**
   - 리스크: Federation 스키마 변경 시 서비스 간 호환성 문제
   - 완화 전략:
     - 자동 스키마 검사 도구 (GraphQL Inspector, Apollo Rover)
     - 계약 테스트 자동화 (CI/CD 통합)
     - Schema Registry 도입 및 버전 관리
     - Breaking Change 감지 및 알림

2. **대용량 매출 데이터 처리**
   - 리스크: 시계열 데이터 증가로 인한 성능 저하
   - 완화 전략:
     - 배치 파이프라인으로 OLAP 스토리지 분리 (TimescaleDB/ClickHouse)
     - 데이터 아카이빙 전략 (Hot/Warm/Cold 데이터 분리)
     - 캐싱 전략 적용 (Redis)
     - 읽기 전용 복제본 활용

3. **복잡한 권한 모델 관리**
   - 리스크: 역할/권한 변경 시 시스템 전반에 영향
   - 완화 전략:
     - 중앙 Auth 서비스로 권한 관리 집중화
     - 정책 코드화 (Permission Matrix)
     - Field Level Authorization 명확한 정의
     - 권한 변경 감사 로그

4. **서비스 간 데이터 정합성**
   - 리스크: 분산 환경에서 데이터 불일치
   - 완화 전략:
     - 이벤트 소싱 패턴 적용 (필요 시)
     - 최종 일관성 보장 (Saga 패턴)
     - 정합성 검증 배치 작업
     - 보상 트랜잭션 로직

### 운영 리스크

1. **운영 복잡도 증가**
   - 리스크: 마이크로서비스 환경에서 운영 부담 증가
   - 완화 전략:
     - IaC 기반 인프라 자동화 (Terraform/Helm)
     - Runbook/온콜 문서화
     - 자동화된 모니터링 및 알림
     - 중앙화된 로깅 및 트레이싱

2. **성능 및 확장성**
   - 리스크: 사용자 증가 시 응답 시간 저하
   - 완화 전략:
     - SLO 목표 설정 (p95 300ms 이하)
     - 자동 스케일링 (HPA)
     - CDN 및 캐싱 전략
     - 부하 테스트 정기 실행

3. **보안 취약점**
   - 리스크: 인증/인가 우회, 데이터 유출
   - 완화 전략:
     - 정기 보안 스캔 (Trivy, Snyk)
     - mTLS 적용 (서비스 간 통신)
     - PII 데이터 암호화
     - 감사 로그 및 침입 탐지

### 비즈니스 리스크

1. **요구사항 변경**
   - 리스크: 빈번한 요구사항 변경으로 인한 개발 지연
   - 완화 전략:
     - Agile/스프린트 방식 적용
     - Feature Flag 활용
     - 모듈화된 아키텍처로 유연성 확보
     - 정기적인 이해관계자 피드백 수집

2. **외부 시스템 통합 실패**
   - 리스크: POS/ERP 시스템 연동 시 호환성 문제
   - 완화 전략:
     - API 버전 관리 전략
     - 표준 프로토콜 사용 (REST, GraphQL)
     - 모의(Mock) 서버로 개발 환경 구축
     - 점진적 통합 전략

---

## 개발 Phase별 Task 정리

### v0.0.x: CONFIG - Market analysis, dependencies, spikes, project setup

#### 완료된 작업

- ✅ `tasks/spec/msa-foundation.md` - MSA 기반 아키텍처 설계 및 스펙 확정
  - 상태: done
  - 핵심 페르소나별 사용자 여정 정의
  - 근태/재고/매출 서비스에 대한 MVP 스코프 도출
  - GraphQL Federation 아키텍처 다이어그램 검토 및 피드백 반영

- ✅ `tasks/analytics/kpi-definition.md` - KPI Framework 정의
  - 상태: completed
  - 완료일: 2025-11-07
  - 목적: 근태, 재고, 매출 영역의 핵심 KPI 정의 및 데이터 파이프라인 설계 기준 마련
  - 산출물:
    - KPI 정의 문서 (`docs/analytics/kpi-matrix.md`)
    - 대시보드 와이어프레임 (`docs/analytics/dashboard-wireframes.md`)
    - 데이터 품질 검증 체크리스트 (`docs/analytics/data-quality-checklist.md`)
    - Analytics Handbook 업데이트 (`docs/analytics/README.md`)

#### 진행 중/예정 작업

- 현재 v0.0.x 단계의 진행 중 또는 예정 작업 없음

---

### v0.1.x: PROJECT - Architecture, interfaces, API contracts, method stubs

#### 진행 중 작업

- 🔄 `tasks/backend/federation-schema.md` - Federation Schema Baseline
  - 상태: in-progress
  - 목적: Attendance, Inventory, Sales 서비스의 GraphQL Subgraph 스키마 초안 정의 및 Federation 키 전략 확정
  - 산출물: `schemas/attendance.graphql`, `schemas/inventory.graphql`, `schemas/sales.graphql` 초안

- 🔄 `tasks/backend/generate-backend-subgraphs-from-federation.md` - Subgraph 서비스 스캐폴딩
  - 상태: in-progress
  - 목적: Federation 스키마를 기반으로 NestJS + Apollo Federation Subgraph 서비스 스캐폴딩
  - 산출물: 각 서비스 디렉터리 및 기본 구조

#### 예정 작업

- ✅ `tasks/backend/federation-integration-test-and-validation.md` - Federation 통합 검증 및 서비스 간 데이터 조인 구현 **[HIGH PRIORITY]**
  - 상태: completed
  - 완료일: 2025-11-05
  - 목적: Gateway를 통한 Federation 통합이 실제로 작동하는지 검증하고, 서비스 간 데이터 조인을 구현
  - 완료된 항목:
    - ✅ Federation 스키마 통합 검증 (모든 Subgraph 연결 확인)
    - ✅ 모든 모델에 @key 디렉티브 추가 (Employee, Attendance, Product, InventoryItem, Order, User, Notification)
    - ✅ DataLoader 패턴 구현 (InventoryItem → Product 조인)
    - ✅ 서비스 간 데이터 조인 구현 (InventoryItem에서 Product 정보 조회)
    - ✅ 통합 테스트 작성 (Federation 통합 검증 테스트)
    - ✅ GitHub Actions에 Federation 테스트 추가
    - ✅ 문서화 (`docs/backend/federation-integration.md`)
  - 산출물:
    - Federation 통합 검증 테스트 (`tests/federation-integration.test.ts`)
    - DataLoader 구현 (`backend/inventory-service/src/resolvers/inventory.resolver.ts`)
    - Federation 통합 문서 (`docs/backend/federation-integration.md`)
    - GitHub Actions 통합 테스트 단계 업데이트

- ✅ `tasks/backend/federation-integration-mvp.md` - GraphQL Federation 통합 MVP
  - 상태: completed
  - 완료일: 2025-11-05
  - 목적: 각 마이크로서비스의 GraphQL Subgraph를 정의하고 Federation으로 통합
  - 완료된 항목:
    - ✅ 각 서비스 Subgraph Schema 정의 (모든 주요 타입에 @key 디렉티브 적용)
    - ✅ Federation 스키마 통합 (Gateway에서 모든 서비스 연결 및 검증)
    - ✅ 서비스 간 데이터 조인 (InventoryItem → Product 조인, DataLoader 패턴)
    - ✅ 스키마 버전 관리 전략 수립 및 문서화
    - ✅ PurchaseOrder에 @key 디렉티브 추가
  - 산출물:
    - Federation 스키마 개발 가이드 (`docs/backend/federation-schema-guide.md`)
    - 스키마 버전 관리 전략 (`docs/backend/schema-versioning.md`)
    - Federation 통합 문서 업데이트 (`docs/backend/federation-integration.md`)

- 📋 `tasks/frontend/graphql-client.md` - Apollo Client Setup & UI Contract
  - 상태: todo
  - 목적: 관리 콘솔과 점장 포털에서 사용하는 Apollo Client 구성 표준화 및 초기 UI/데이터 계약 수립
  - 완료 기준:
    - Apollo Client 인스턴스 구성 (Auth Link, Error Link, Retry Link)
    - 코드젠 파이프라인(GraphQL Code Generator) 설정
    - Attendance/Inventory 조회 화면 와이어프레임 연결

---

### v0.2.x: TESTS - Test framework, unit/integration tests, fixtures

#### 현재 상태

- ✅ CI/CD 파이프라인에 테스트 실행 단계 준비 완료
  - 상태: completed
  - GitHub Actions 워크플로에 백엔드/프론트엔드 테스트 실행 단계 포함
  - 테스트 미구현 시 graceful fallback 처리

- ✅ 통합 테스트 인프라 구축 (Docker Compose 기반)
  - 상태: completed
  - Docker Compose를 통한 서비스 통합 환경 구성
  - 헬스 체크 엔드포인트 검증
  - CI/CD 파이프라인에 통합 테스트 단계 포함

- ✅ Federation 통합 테스트 구현
  - 상태: completed
  - 완료일: 2025-11-05
  - 루트 레벨 테스트 환경 구성 (package.json, jest.config.js, tsconfig.json)
  - Federation 통합 검증 테스트 작성 (`tests/federation-integration.test.ts`)
  - GitHub Actions에 Federation 테스트 단계 추가
  - 모든 서비스 헬스 체크 및 통합 테스트 실행

#### 진행 중/예정 작업

- 📋 테스트 프레임워크 설정
  - 상태: todo
  - 목적: 백엔드 및 프론트엔드 서비스에 대한 테스트 프레임워크 설정
  - 백엔드: Jest 또는 Vitest 기반 단위/통합 테스트 설정
  - 프론트엔드: Vitest 또는 React Testing Library 기반 컴포넌트 테스트 설정
  - 완료 기준:
    - 각 서비스에 테스트 프레임워크 및 의존성 설치
    - 테스트 설정 파일 구성 (jest.config.ts, vitest.config.ts 등)
    - 테스트 스크립트 추가 (package.json)

- 📋 단위 테스트 작성
  - 상태: todo
  - 목적: 각 서비스의 핵심 비즈니스 로직에 대한 단위 테스트 작성
  - 완료 기준:
    - 백엔드 서비스: Resolver, Service, Model 단위 테스트
    - 프론트엔드: 컴포넌트, Hook, 유틸리티 함수 단위 테스트
    - 테스트 커버리지 목표 설정 및 모니터링

- 📋 통합 테스트 작성
  - 상태: todo
  - 목적: 서비스 간 통합 및 GraphQL API 통합 테스트 작성
  - 완료 기준:
    - GraphQL Query/Mutation 통합 테스트
    - 서비스 간 데이터 조인 테스트
    - 인증/인가 통합 테스트
    - E2E 테스트 시나리오 (Cypress 또는 Playwright)

- 📋 테스트 Fixtures 및 Mock 데이터
  - 상태: todo
  - 목적: 테스트용 데이터 및 Mock 설정 표준화
  - 완료 기준:
    - 공통 테스트 Fixtures 생성
    - GraphQL Mock 설정
    - 데이터베이스 시드 데이터 관리

#### 참고

- 테스트 관련 작업은 각 서비스 및 기능 태스크에 포함되어 있음
- 각 MVP 태스크의 "검증" 섹션에서 단위/통합/E2E 테스트 요구사항 명시

---

### v0.3.x: DATA - Models, schemas, migrations, validation

#### 완료된 작업

- ✅ GraphQL Federation 스키마 정의
  - 상태: completed
  - Attendance Service 스키마 (`schemas/attendance.graphql`)
    - Employee, Attendance, AttendanceReport 타입 정의
    - CreateEmployeeInput, UpdateEmployeeInput 등 Input 타입 정의
  - Inventory Service 스키마 (`schemas/inventory.graphql`)
    - Product, InventoryItem, PurchaseOrder, ReorderRecommendation 타입 정의
    - CreateSKUInput, UpdateSKUInput, SubmitInventoryCountInput 등 Input 타입 정의
  - Sales Service 스키마 (`schemas/sales.graphql`)
    - Order, LineItem, DailySales, WeeklySales, MonthlySales 타입 정의
  - Auth Service 스키마 (`schemas/auth.graphql`)
    - User, Role, Permission 타입 정의
  - Notification Service 스키마 (`schemas/notification.graphql`)
    - Notification, NotificationTemplate 타입 정의

- ✅ 데이터 모델 구현 (TypeScript)
  - 상태: completed
  - Attendance Service:
    - `employee.model.ts` - Employee 엔티티
    - `attendance.model.ts` - Attendance 엔티티
    - `report.model.ts` - AttendanceReport, DailyAttendanceReport, WeeklyAttendanceReport
    - `inputs.model.ts` - Input 타입들
  - Inventory Service:
    - `product.model.ts` - Product 엔티티
    - `inventory.model.ts` - InventoryItem, InventoryAudit, ReorderRecommendation
    - `purchase-order.model.ts` - PurchaseOrder 엔티티
    - `inputs.model.ts` - Input 타입들
  - Sales Service:
    - `sales.model.ts` - Order, LineItem, Sales 리포트 타입들
  - Auth Service:
    - `user.model.ts` - User 엔티티
    - `inputs.model.ts` - Input 타입들
  - Notification Service:
    - `notification.model.ts` - Notification, NotificationTemplate
    - `inputs.model.ts` - Input 타입들

#### 진행 중/예정 작업

- 📋 데이터베이스 스키마 및 마이그레이션
  - 상태: todo
  - 목적: PostgreSQL 데이터베이스 스키마 정의 및 마이그레이션 관리
  - 완료 기준:
    - 각 서비스별 데이터베이스 스키마 정의
    - 마이그레이션 파일 생성 (Prisma 또는 TypeORM)
    - 초기 시드 데이터 생성
    - 데이터베이스 연결 설정

- 📋 데이터 검증 및 Validation
  - 상태: todo
  - 목적: 입력 데이터 검증 및 에러 처리
  - 완료 기준:
    - class-validator 기반 DTO 검증
    - GraphQL Input 타입 검증
    - 커스텀 Validation Pipe 구현
    - 에러 메시지 표준화

#### 참고

- 데이터 모델 및 스키마 작업은 각 서비스 MVP 태스크에 포함되어 있음
- 각 서비스의 "완료 기준" 섹션에서 엔티티 및 데이터베이스 모델 구현 요구사항 명시

---

### v0.4.x: CODE - Business logic, services, error handling

#### 완료된 작업

- ✅ Gateway 서비스 MVP
  - 상태: completed
  - Apollo Federation Gateway 구현
  - 인증 미들웨어 (`auth.middleware.ts`) - Introspection 쿼리 처리 개선
  - Observability 미들웨어 (`observability.middleware.ts`)
  - 보안 미들웨어 (`security.middleware.ts`)
  - CORS 및 보안 설정
  - 미들웨어 순서 최적화 (express.json() → authMiddleware)

- ✅ Attendance 서비스 MVP (부분 구현)
  - 상태: in-progress
  - 직원 기본 정보 관리 (CRUD)
    - `employee.resolver.ts` - Employee Query/Mutation 구현
    - CreateEmployee, UpdateEmployee, DeleteEmployee, GetEmployee, ListEmployees
  - 출퇴근 기록 입력 및 조회
    - `attendance.resolver.ts` - Attendance Query/Mutation 구현
    - CheckIn, CheckOut, GetAttendanceRecord, ListAttendanceRecords
  - 근태 승인 워크플로
    - ApproveAttendance, RejectAttendance, RequestAttendanceCorrection
    - PendingApprovals 조회
  - 간단한 근태 리포트
    - `report.resolver.ts` - Report Query 구현
    - DailyAttendanceReport, WeeklyAttendanceReport

- ✅ Inventory 서비스 MVP (부분 구현)
  - 상태: in-progress
  - SKU 기본 정보 관리
    - `product.resolver.ts` - Product Query/Mutation 구현
    - CreateSKU, UpdateSKU, GetSKU, ListSKUs
  - 재고 실사 입력 및 조회
    - `inventory.resolver.ts` - Inventory Query/Mutation 구현
    - SubmitInventoryCount, GetStoreInventory, ListStoreInventories
    - DataLoader 패턴 구현 (InventoryItem → Product 조인)
  - 발주 요청 및 입고 처리
    - `purchase-order.resolver.ts` - PurchaseOrder Query/Mutation 구현
    - CreatePurchaseOrder, ApprovePurchaseOrder, RejectPurchaseOrder, ReceiveInventory
  - Federation 디렉티브 추가 (@key)

- ✅ Sales 서비스 MVP (부분 구현)
  - 상태: in-progress
  - 매출 데이터 입력 및 조회
    - `sales.resolver.ts` - Sales Query/Mutation 구현
  - 일별/주별/월별 매출 집계
    - DailySales, WeeklySales, MonthlySales Query 구현
    - SalesDashboard Query 구현

- ✅ Auth 서비스 MVP (부분 구현)
  - 상태: in-progress
  - 기본 사용자 인증 (JWT)
    - `auth.resolver.ts` - Auth Query/Mutation 구현
    - Login, Register, GetCurrentUser 등
  - 역할 기반 접근 제어 (RBAC) - 기본 구조 구현

- ✅ Notification 서비스 MVP (부분 구현)
  - 상태: in-progress
  - 알림 발송 기능
    - `notification.resolver.ts` - Notification Query/Mutation 구현
  - 알림 템플릿 관리 - 기본 구조 구현

#### 진행 중/예정 작업

- 📋 `tasks/backend/auth-service-mvp.md` - 인증/인가 서비스 MVP 완성
  - 상태: in-progress
  - 완료 기준:
    - Refresh Token 자동 갱신 로직
    - Field Level Authorization 구현
    - 권한 테스트 케이스 작성

- 📋 `tasks/backend/attendance-service-mvp.md` - 근태 서비스 MVP 완성
  - 상태: in-progress
  - 완료 기준:
    - 데이터베이스 연동 완료
    - 비즈니스 로직 검증 및 테스트
    - 에러 처리 개선

- 📋 `tasks/backend/inventory-service-mvp.md` - 재고 서비스 MVP 완성
  - 상태: in-progress
  - 완료 기준:
    - 안전재고 임계치 설정 및 리오더 추천 로직 완성
    - 데이터베이스 연동 완료
    - 비즈니스 로직 검증 및 테스트

- 📋 `tasks/backend/sales-service-mvp.md` - 매출 서비스 MVP 완성
  - 상태: in-progress
  - 완료 기준:
    - 주문 관리 기능 구현
    - 데이터베이스 연동 완료
    - 비즈니스 로직 검증 및 테스트

- 📋 `tasks/backend/notification-service-mvp.md` - 알림 서비스 MVP 완성
  - 상태: in-progress
  - 완료 기준:
    - 이메일 발송 기능 구현
    - 알림 템플릿 관리 완성
    - 알림 이력 조회 기능 완성

- 📋 `tasks/ops/implement-notification-auth-services.md` - Notification/Auth 서비스 구현
  - 상태: todo

---

### v0.5.x: DEVOPS - CI/CD, deployment, security

#### 진행 중 작업

- 🔄 `tasks/ops/infrastructure-mvp.md` - 인프라 MVP 설정
  - 상태: in-progress
  - 목적: 기본 인프라 환경 구축 (CI/CD 파이프라인, Docker 컨테이너화, 로컬 개발 환경)
  - 완료 기준:
    - 기본 CI/CD 파이프라인 (GitHub Actions)
    - Docker 컨테이너화
    - 로컬 개발 환경 설정
    - 기본 모니터링 설정

#### 완료된 작업

- ✅ `tasks/ops/dev-docker-compose.md` - 개발용 Docker Compose 설정
  - 상태: completed
  - 목적: 로컬 개발 환경에서 코드 변경사항이 바로 반영되는 개발용 Docker Compose 파일 생성
  - 완료 기준:
    - 개발용 Docker Compose 파일 생성
    - 백엔드 서비스 핫 리로드 설정
    - 프론트엔드 핫 리로드 설정
    - 데이터베이스 및 인프라 설정

#### 예정 작업

- 📋 `tasks/ops/cicd-pipeline.md` - CI/CD Pipeline Bootstrap
  - 상태: todo
  - 목적: GitHub Actions, Docker, Argo CD를 이용한 기본 CI/CD 파이프라인 구성 및 보안/품질 검사 자동화
  - 완료 기준:
    - GitHub Actions 워크플로 초안 작성
    - Docker 이미지 빌드 & Trivy 스캔 스텝 추가
    - Argo CD Application 매니페스트 샘플 생성
    - Release Checklist와 연동

#### 버그 수정 작업

- 🔄 `tasks/ops/fix-github-actions-pr1-failures.md` - GitHub Actions PR1 실패 수정
  - 상태: in-progress

- 🔄 `tasks/ops/fix-github-actions-failures-2025-11-04.md` - GitHub Actions 실패 수정
  - 상태: in-progress

- 🔄 `tasks/ops/fix-github-actions-failure-0f75c29.md` - GitHub Actions 실패 수정
  - 상태: in-progress

- 📋 `tasks/ops/fix-integration-test-docker-compose-error.md` - 통합 테스트 Docker Compose 에러 수정
  - 상태: pending

- 📋 `tasks/ops/implement-notification-auth-services.md` - Notification/Auth 서비스 구현
  - 상태: todo

---

### v0.6.x: PUBLIC - User interfaces, responsive design

#### 완료된 작업

- ✅ `tasks/frontend/fix-frontend-lint-errors.md` - GitHub Actions Frontend Lint 에러 수정
  - 상태: completed
  - 목적: GitHub Actions의 Frontend Build & Test 단계에서 lint 에러 수정
  - 주요 수정사항:
    - ESLint 설정 개선 (TypeScript resolver)
    - Import 정렬 자동 수정
    - 코드 품질 에러 수정

- ✅ `tasks/frontend/login-401-error-fix.md` - 로그인 후 Products Operation 401 에러 수정
  - 상태: completed
  - 목적: 프론트엔드에서 로그인 후 Products 쿼리 실행 시 401 에러 해결
  - 해결 방법: 개발 환경에서 사용할 수 있는 실제 JWT 토큰 생성

- ✅ `tasks/frontend/product-model-field-rename.md` - Product 모델 필드명 통일 및 타입 개선
  - 상태: completed
  - 목적: Product 모델의 필드명을 `price`에서 `unitPrice`로 통일하고 타입 안전성 개선

- ✅ `tasks/frontend/getemployees-storeid-type-fix.md` - 백엔드 GraphQL resolver storeId/employeeId ID 타입 수정
  - 상태: completed
  - 목적: 프론트엔드와 백엔드 간 GraphQL ID 타입 불일치 문제 해결

- ✅ `tasks/frontend/backend-integration-mvp.md` - 최신 백엔드 기능 연동 MVP (부분 완료)
  - 상태: in-progress
  - 완료된 항목:
    - JWT 인증 시스템 구현 (로그인, 로그아웃, 토큰 관리)
    - Employee 관리 기능 (목록, 상세, 생성, 수정, 삭제)
    - Attendance 기능 (출퇴근 기록, 승인/거부, 수정 요청)
    - Attendance Report 기능 (일별/주별 리포트)
    - Purchase Order 기능 (목록, 상세, 생성, 승인/거부, 입고 처리)
    - Sales 리포트 기능 (일별/주별/월별 리포트, 대시보드)
  - 진행 중/예정 항목:
    - 리포트 데이터 시각화 (차트)
    - 재고 실사 입력 기능
    - 리오더 추천 목록 조회
    - 주문 관리 기능

#### 진행 중/예정 작업

- 📋 `tasks/frontend/admin-dashboard-mvp.md` - 관리자 대시보드 MVP 구현
  - 상태: todo
  - 목적: HQ 운영 관리자를 위한 관리자 대시보드 구현
  - 완료 기준:
    - 전체 지점 KPI 대시보드
    - 이상 징후 알림 표시
    - 지점별 상태 요약
    - 정책 변경 인터페이스
    - 주간/월간 리포트 조회

- 📋 `tasks/frontend/store-manager-portal-mvp.md` - 점장 포털 MVP 구현
  - 상태: todo
  - 목적: 지점 점장을 위한 포털 구현
  - 완료 기준:
    - 근태 승인 요청 확인 및 승인/거부 (부분 구현됨)
    - 전일 매출 데이터 검토 (부분 구현됨)
    - 재고 상태 확인 및 발주 필요 품목 검토 (부분 구현됨)
    - 스케줄 확인 및 교대 조정
    - 출퇴근 기록 검증 (부분 구현됨)
    - 재고 실사 결과 입력 및 검증
    - 입고 확인 및 재고 업데이트 (부분 구현됨)
    - 일별/주별 성과 리포트 (부분 구현됨)

- 📋 `tasks/frontend/employee-mobile-mvp.md` - 직원 모바일 앱/PWA MVP 구현
  - 상태: todo
  - 목적: 현장 직원을 위한 모바일 앱 또는 PWA 구현
  - 완료 기준:
    - 출퇴근 기록 (부분 구현됨)
    - 재고 실사 입력
    - 판매 활동
    - 고객 이벤트 기록
    - PWA 기본 기능

- 📋 `tasks/frontend/graphql-schema-compatibility-fix.md` - GraphQL 스키마 호환성 수정 작업
  - 상태: todo
  - 목적: Gateway의 실제 통합 GraphQL 스키마와 프론트엔드에서 사용하는 쿼리/뮤테이션 이름 일치시키기
  - 완료 기준:
    - Gateway 통합 스키마 확인
    - Employee 관련 쿼리 수정
    - Attendance 관련 쿼리 수정
    - Attendance Report 쿼리 수정
    - 모든 페이지 쿼리 업데이트

---

### v0.7.x: MONEY - Billing, payments, subscriptions

#### 향후 작업

- 향후 과금, 결제, 구독 기능 구현 시 추가 예정

---

### v0.8.x: SUPPORT - Documentation, support systems, feedback

#### 향후 작업

- 향후 문서화, 지원 시스템, 피드백 기능 구현 시 추가 예정

---

### v0.9.x: SCALE - Performance, caching, load balancing

#### 향후 작업

- 향후 성능 최적화, 캐싱, 로드 밸런싱 기능 구현 시 추가 예정

---

### v1.0.0+: RELEASE - Final testing, documentation, launch

#### 향후 작업

- MVP 완료 후 최종 테스트, 문서화, 런칭 작업 시 추가 예정

---

## Phase별 작업 요약

### 현재 진행 상황

- **v0.0.x (CONFIG)**: 2개 완료
- **v0.1.x (PROJECT)**: 2개 진행 중, 1개 예정, 2개 완료 (Federation 통합 검증, Federation 통합 MVP)
- **v0.2.x (TESTS)**: 3개 완료 (CI/CD 테스트 단계, 통합 테스트 인프라, Federation 통합 테스트), 4개 예정 (테스트 프레임워크 설정, 단위 테스트, 통합 테스트, Fixtures)
- **v0.3.x (DATA)**: 2개 완료 (GraphQL 스키마 정의, 데이터 모델 구현), 2개 예정 (DB 스키마/마이그레이션, 데이터 검증)
- **v0.4.x (CODE)**: 6개 부분 완료/진행 중 (Gateway 완료, Attendance/Inventory/Sales/Auth/Notification 부분 구현), 6개 예정 (서비스 완성)
- **v0.5.x (DEVOPS)**: 1개 진행 중, 1개 완료, 1개 예정, 5개 버그 수정
- **v0.6.x (PUBLIC)**: 5개 완료, 4개 예정 (백엔드 연동 MVP 부분 완료)
- **v0.7.x (MONEY)**: 작업 없음
- **v0.8.x (SUPPORT)**: 작업 없음
- **v0.9.x (SCALE)**: 작업 없음
- **v1.0.0+ (RELEASE)**: 작업 없음

### 우선순위

1. **High Priority**:

   - v0.1.x: Federation 스키마 및 통합
   - v0.4.x: 백엔드 서비스 MVP 구현
   - v0.5.x: CI/CD 파이프라인 안정화
   - v0.6.x: 프론트엔드 백엔드 연동

2. **Medium Priority**:

   - v0.0.x: KPI 정의
   - v0.6.x: 프론트엔드 UI 구현

3. **Low Priority / Future**:

   - v0.7.x ~ v1.0.0+: 향후 버전에서 구현
