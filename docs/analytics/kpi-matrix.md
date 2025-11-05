# KPI Matrix

## 개요

본 문서는 Store Management Platform의 핵심 KPI를 정의하고, 데이터 소스, 산출 주기, 책임자(RACI)를 명시합니다.

**업데이트 일자**: 2025-11-07  
**버전**: 1.0  
**담당자**: Analytics Agent

---

## KPI 정의표

| Domain   | KPI                              | 정의 / 산출 공식                                                                                | 데이터 소스                                                                                      | 주기 | RACI                                                                                            | 목표값 (예시)           |
| -------- | -------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---- | ----------------------------------------------------------------------------------------------- | ----------------------- |
| **근태** | 출퇴근 준수율                    | `정상 출퇴근 기록 수 / 전체 스케줄 수 * 100`                                                    | `attendance-service` (PostgreSQL) - `Attendance` 테이블                                          | 일별 | **R**: Attendance Manager<br>**A**: Store Manager<br>**C**: HQ 운영팀<br>**I**: Analytics Agent | ≥ 95%                   |
| **근태** | 평균 근무 시간                   | `전체 근무 시간 합계 / 출근 직원 수` (시간 단위)                                                | `attendance-service` - `Attendance.workingHours`                                                 | 일별 | **R**: Attendance Manager<br>**A**: Store Manager                                               | 8시간 ± 1시간           |
| **근태** | 결근율                           | `결근 기록 수 / 전체 스케줄 수 * 100`                                                           | `attendance-service` - `Attendance.status = ABSENT`                                              | 일별 | **R**: Attendance Manager<br>**A**: Store Manager                                               | ≤ 3%                    |
| **근태** | 지각율                           | `지각 기록 수 / 전체 출근 기록 수 * 100`                                                        | `attendance-service` - `Attendance.checkInAt` 기준                                               | 일별 | **R**: Attendance Manager                                                                       | ≤ 5%                    |
| **근태** | 초과근무 승인율                  | `승인된 초과근무 요청 / 전체 초과근무 요청 * 100`                                               | `attendance-service` - `Attendance.workingHours > 8`                                             | 주별 | **R**: Store Manager<br>**A**: HQ 운영팀                                                        | 60-80%                  |
| **근태** | 일별 출근률                      | `출근 기록 수 / 전체 직원 수 * 100`                                                             | `attendance-service` - `DailyAttendanceReport.attendanceRate`                                    | 일별 | **R**: Attendance Manager                                                                       | ≥ 90%                   |
| **재고** | 재고 회전율 (Inventory Turnover) | `기간 매출원가 / 평균 재고 자산`<br>또는 `판매된 수량 / 평균 재고 수량`                         | `inventory-service` + `sales-service` ETL<br>(`InventoryItem.quantityOnHand`, `Order.lineItems`) | 주별 | **R**: Inventory Analyst<br>**A**: Store Manager<br>**C**: HQ 재고팀                            | 4-6회/월                |
| **재고** | 안전재고 준수율                  | `안전재고 이상 SKU 수 / 전체 SKU 수 * 100`<br>또는 `quantityOnHand >= reorderPoint인 항목 비율` | `inventory-service` - `InventoryItem`                                                            | 일별 | **R**: Inventory Analyst<br>**A**: Store Manager                                                | ≥ 85%                   |
| **재고** | 재고 실사 정확도                 | `1 - ABS(실사 수량 - 시스템 수량) / 시스템 수량 * 100`                                          | `inventory-service` - `InventoryAudit`                                                           | 주별 | **R**: Inventory Analyst                                                                        | ≥ 98%                   |
| **재고** | 재고 부족 알림 건수              | `reorderRecommendations` 조회 결과 중 `urgency = HIGH` 건수                                     | `inventory-service` - `ReorderRecommendation`                                                    | 일별 | **R**: Inventory Analyst<br>**A**: Store Manager                                                | ≤ 5건/일                |
| **재고** | 발주 처리 시간                   | `발주 승인 시점 - 발주 요청 시점` (시간 단위)                                                   | `inventory-service` - `PurchaseOrder`                                                            | 주별 | **R**: Store Manager<br>**A**: HQ 재고팀                                                        | ≤ 24시간                |
| **재고** | 재고 가치 (Inventory Value)      | `SUM(quantityOnHand * unitPrice)` (모든 SKU)                                                    | `inventory-service` + `Product`                                                                  | 일별 | **R**: Inventory Analyst                                                                        | 목표값: 비즈니스별 설정 |
| **매출** | 일별 매출 (Total Daily Sales)    | `SUM(Order.totalAmount)` (당일)                                                                 | `sales-service` - `Order` (TimescaleDB)                                                          | 일별 | **R**: Sales Analyst<br>**A**: Store Manager                                                    | 목표값: 비즈니스별 설정 |
| **매출** | 일별 매출 성장률                 | `(당일 매출 - 전일 매출) / 전일 매출 * 100`                                                     | `sales-service` - `DailySales`                                                                   | 일별 | **R**: Sales Analyst                                                                            | ≥ 0% (긍정적 성장)      |
| **매출** | 주별 매출 성장률                 | `(당주 매출 - 전주 매출) / 전주 매출 * 100`                                                     | `sales-service` - 주별 집계                                                                      | 주별 | **R**: Sales Analyst                                                                            | ≥ 2%                    |
| **매출** | 월별 매출 성장률                 | `(당월 매출 - 전월 매출) / 전월 매출 * 100`                                                     | `sales-service` - `MonthlySales.growthRate`                                                      | 월별 | **R**: Sales Analyst<br>**A**: HQ 운영팀                                                        | ≥ 5%                    |
| **매출** | 평균 거래액 (ATV)                | `총 매출 / 거래 건수`                                                                           | `sales-service` - `DailySales.averageTransactionValue`                                           | 일별 | **R**: Sales Analyst                                                                            | 목표값: 비즈니스별 설정 |
| **매출** | 거래 건수 (Transaction Count)    | `COUNT(DISTINCT Order.orderId)`                                                                 | `sales-service` - `DailySales.transactionCount`                                                  | 일별 | **R**: Sales Analyst                                                                            | 목표값: 비즈니스별 설정 |
| **매출** | 프로모션 ROI                     | `(프로모션 매출 - 프로모션 비용) / 프로모션 비용 * 100`                                         | `sales-service` + 재무 데이터 (향후)                                                             | 월별 | **R**: Marketing Lead<br>**A**: Sales Analyst                                                   | ≥ 150%                  |
| **매출** | 채널별 매출 비중                 | `채널 매출 / 전체 매출 * 100`                                                                   | `sales-service` - `ChannelSales`                                                                 | 일별 | **R**: Sales Analyst                                                                            | 목표값: 비즈니스별 설정 |
| **매출** | SKU별 매출 기여도 (Top 10)       | `SKU별 매출 합계 / 전체 매출 * 100` (상위 10개)                                                 | `sales-service` - `Order.lineItems`                                                              | 주별 | **R**: Sales Analyst                                                                            | 목표값: 비즈니스별 설정 |
| **운영** | 알람 대응 시간 (MTTA)            | 알람 감지부터 대응 시작까지 평균 시간                                                           | Observability Stack (Prometheus/Grafana)                                                         | 주별 | **R**: DevOps Agent<br>**A**: On-Call Engineer                                                  | ≤ 15분                  |
| **운영** | 알람 해결 시간 (MTTR)            | 알람 감지부터 해결까지 평균 시간                                                                | Observability Stack                                                                              | 주별 | **R**: DevOps Agent                                                                             | ≤ 1시간                 |
| **운영** | 서비스 가용성                    | `(총 시간 - 다운타임) / 총 시간 * 100`                                                          | Uptime Monitoring                                                                                | 월별 | **R**: DevOps Agent<br>**A**: SRE Team                                                          | ≥ 99.9%                 |
| **운영** | GraphQL 응답 시간 (p95)          | 95 백분위수 응답 시간                                                                           | OpenTelemetry Tracing                                                                            | 일별 | **R**: DevOps Agent                                                                             | ≤ 300ms                 |
| **통합** | 지점별 종합 점수                 | 가중 평균: 출근률(30%) + 안전재고 준수율(30%) + 매출 달성률(40%)                                | 근태/재고/매출 서비스 통합                                                                       | 주별 | **R**: HQ 운영팀<br>**A**: Analytics Agent                                                      | ≥ 80점                  |

---

## RACI 역할 정의

- **R (Responsible)**: 실제 작업 수행자
- **A (Accountable)**: 최종 책임자 (승인/거부 권한)
- **C (Consulted)**: 자문 제공자
- **I (Informed)**: 정보 공유 대상

---

## 데이터 소스 상세

### 근태 서비스 (`attendance-service`)
- **데이터베이스**: PostgreSQL
- **주요 테이블/엔티티**:
  - `Employee`: 직원 기본 정보
  - `Attendance`: 출퇴근 기록 (`checkInAt`, `checkOutAt`, `workingHours`, `status`)
  - `DailyAttendanceReport`: 일별 집계 리포트
  - `WeeklyAttendanceReport`: 주별 집계 리포트
- **데이터 주기**: 실시간 (출퇴근 기록 시), 집계는 일별/주별 배치

### 재고 서비스 (`inventory-service`)
- **데이터베이스**: PostgreSQL
- **주요 테이블/엔티티**:
  - `Product`: SKU 기본 정보 (`unitPrice`)
  - `InventoryItem`: 재고 수량 (`quantityOnHand`, `reorderPoint`, `reserved`)
  - `InventoryAudit`: 실사 이력
  - `PurchaseOrder`: 발주 정보
  - `ReorderRecommendation`: 리오더 추천
- **데이터 주기**: 실시간 (재고 변동 시), 리오더 추천은 일별 배치

### 매출 서비스 (`sales-service`)
- **데이터베이스**: TimescaleDB (시계열 최적화)
- **주요 테이블/엔티티**:
  - `Order`: 주문 정보 (`totalAmount`, `channel`, `settledAt`)
  - `LineItem`: 주문 상세 (`sku`, `quantity`, `unitPrice`, `subtotal`)
  - `DailySales`: 일별 집계
  - `MonthlySales`: 월별 집계 (전월 대비 성장률 포함)
  - `ChannelSales`: 채널별 매출 분류
- **데이터 주기**: 실시간 (주문 기록 시), 집계는 일별/주별/월별 배치

---

## 데이터 파이프라인

### ETL 프로세스
1. **수집**: Kafka → Debezium (CDC) → Data Lake (S3)
2. **변환**: dbt 또는 Dagster로 ETL 수행
   - 근태/재고/매출 데이터 정규화
   - 집계 테이블 생성 (`fact_attendance`, `fact_inventory`, `fact_sales`)
   - Dimension 테이블 유지 (`dim_store`, `dim_employee`, `dim_time`)
3. **저장**: 
   - OLTP: PostgreSQL (근태, 재고)
   - 시계열: TimescaleDB (매출)
   - OLAP: BigQuery/Snowflake (분석용)
4. **시각화**: Metabase/Superset 또는 Looker Studio

---

## 목표값 설정 가이드

- **기준값 설정**: 각 KPI는 비즈니스 목표와 과거 성과 데이터를 기반으로 설정
- **목표값 검토 주기**: 분기별 리뷰 및 조정
- **예외 처리**: 계절성, 특수 이벤트(프로모션, 공휴일) 고려

---

## 향후 추가 예정 KPI

- 직원 만족도 (NPS)
- 재고 손실률 (Shrinkage)
- 재고 부족으로 인한 매출 손실 (Out-of-Stock Impact)
- SKU별 수익성 분석
- 프로모션 효과 분석 (증분 매출)

---

## 참고

- 본 KPI는 `/evaluations` 리포트에 포함되어야 하며, 기준값/목표치는 추후 워크숍에서 합의
- 데이터 품질 점검은 Great Expectations 시나리오와 연동 예정
- Analytics Handbook: `docs/analytics/README.md`
