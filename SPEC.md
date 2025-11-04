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
