# Store Management Platform SPEC

## 제품 개요

- 목표: 다점포 환경에서 근태, 재고, 매출을 통합 관리하는 SaaS형 상점 운영 플랫폼
- 타깃 사용자: 본사 운영 관리자, 지점 점장, 현장 직원
- 주요 가치: 실시간 데이터 동기화, 자동화된 근태 검증, 수요 기반 재고 추천, 매출 인사이트 대시보드

## 사용자 페르소나

- **HQ 운영 관리자**: 모든 지점의 KPI와 이슈를 모니터링하고 정책을 배포
- **지점 점장**: 매장별 근태 승인, 재고 발주, 일별 매출 점검 및 개선 액션 수행
- **현장 직원**: 모바일 앱으로 출퇴근 기록, 재고 실사 입력, 판매 프로모션 진행

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

## 로드맵 (고수준)

- **M0**: 핵심 근태/재고/매출 조회 + 기본 알람
- **M1**: 모바일 근태 검증, 재고 리오더 추천, KPI 대시보드
- **M2**: 외부 ERP/POS 통합, 예측 모델, 커스텀 리포트
- **M3**: AI 기반 수요 예측, 자동 스케줄링, 멀티 국가 지원

## 리스크 및 완화 전략

- 서비스 간 GraphQL 스키마 드리프트 → 자동 스키마 검사 & 계약 테스트
- 대용량 매출 데이터 → 배치 파이프라인 + OLAP 스토리지 분리
- 복잡한 권한 모델 → 중앙 Auth 서비스 + 정책 코드화(Permission Matrix)
- 운영 지연 → IaC 기반 자동화, Runbook/온콜 문서화
