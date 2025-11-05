# Analytics Handbook

## 목적

근태, 재고, 매출 데이터를 통합 분석하여 지점 및 본사의 의사결정을 지원합니다.

**업데이트 일자**: 2025-11-07  
**버전**: 1.0  
**담당자**: Analytics Agent

---

## 개요

Store Management Platform의 Analytics 시스템은 다음과 같은 영역을 다룹니다:

- **근태 분석**: 출퇴근 패턴, 근무 시간, 결근율 등
- **재고 분석**: 재고 회전율, 안전재고 준수율, 실사 정확도 등
- **매출 분석**: 일별/주별/월별 성장률, 프로모션 ROI, SKU별 기여도 등
- **운영 분석**: 서비스 가용성, 알람 대응 시간 등

---

## KPI 정의

상세한 KPI 정의는 [KPI Matrix 문서](./kpi-matrix.md)를 참고하세요.

### 주요 KPI 카테고리

#### 근태 KPI
- 출퇴근 준수율
- 평균 근무 시간
- 결근율
- 지각율
- 초과근무 승인율
- 일별 출근률

#### 재고 KPI
- 재고 회전율 (Inventory Turnover)
- 안전재고 준수율
- 재고 실사 정확도
- 재고 부족 알림 건수
- 발주 처리 시간
- 재고 가치 (Inventory Value)

#### 매출 KPI
- 일별/주별/월별 매출 및 성장률
- 평균 거래액 (ATV)
- 거래 건수
- 프로모션 ROI
- 채널별 매출 비중
- SKU별 매출 기여도

#### 운영 KPI
- 알람 대응 시간 (MTTA/MTTR)
- 서비스 가용성
- GraphQL 응답 시간 (p95)

#### 통합 KPI
- 지점별 종합 점수

---

## 데이터 파이프라인

### 아키텍처

```
┌─────────────────┐
│ Source Services │
│ (Attendance,    │
│  Inventory,     │
│  Sales)         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Kafka (CDC)     │
│ Debezium        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Data Lake (S3)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ETL (dbt/Dagster)│
│ - 정규화        │
│ - 집계          │
│ - 변환          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Data Warehouse  │
│ - OLTP: PostgreSQL│
│ - 시계열: TimescaleDB│
│ - OLAP: BigQuery│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Visualization   │
│ - Metabase      │
│ - Superset      │
│ - Looker Studio │
└─────────────────┘
```

### 데이터 수집

- **이벤트 수집**: Kafka → Debezium (Change Data Capture) → Data Lake (S3)
- **실시간 스트리밍**: GraphQL Subscription 또는 WebSocket
- **배치 수집**: 일별/주별/월별 ETL 작업

### 데이터 변환

- **ETL 도구**: dbt 또는 Dagster
- **주요 작업**:
  - 근태/재고/매출 데이터 정규화
  - 집계 테이블 생성 (`fact_attendance`, `fact_inventory`, `fact_sales`)
  - Dimension 테이블 유지 (`dim_store`, `dim_employee`, `dim_time`)
  - 데이터 품질 검증 (Great Expectations)

### 데이터 저장

- **OLTP**: PostgreSQL (근태, 재고 서비스)
- **시계열**: TimescaleDB (매출 서비스)
- **OLAP**: BigQuery/Snowflake (분석용 데이터 웨어하우스)
- **캐시**: Redis (실시간 대시보드 데이터)

### 데이터 시각화

- **도구**: Metabase, Superset, 또는 Looker Studio
- **대시보드**: 
  - HQ 운영 관리자 대시보드
  - 지점 점장 대시보드
  - 분석 대시보드
  - 모바일 앱 대시보드
- **와이어프레임**: [대시보드 와이어프레임 문서](./dashboard-wireframes.md) 참고

---

## 모델링 전략

### 데이터 웨어하우스 스키마

#### Star Schema 구조

**Fact 테이블**:
- `fact_attendance`: 출퇴근 기록 (날짜, 직원, 지점, 근무 시간 등)
- `fact_inventory`: 재고 변동 이력 (날짜, SKU, 지점, 수량 변화 등)
- `fact_sales`: 매출 거래 (날짜, 주문, 지점, 금액 등)

**Dimension 테이블**:
- `dim_store`: 지점 정보 (지점 ID, 이름, 지역 등)
- `dim_employee`: 직원 정보 (직원 ID, 이름, 역할 등)
- `dim_time`: 시간 차원 (날짜, 주, 월, 분기, 연도 등)
- `dim_product`: 상품 정보 (SKU ID, 이름, 카테고리 등)

#### 시계열 데이터 모델

- **TimescaleDB 하이퍼테이블**: `orders`, `daily_sales`, `monthly_sales`
- **보존 정책**: Hot 데이터 (최근 3개월), Warm 데이터 (3개월~1년), Cold 데이터 (1년 이상)

### 예측 모델

#### 수요 예측
- **모델**: LSTM, Prophet, 또는 ARIMA
- **대상**: SKU별 수요 예측
- **입력 데이터**: 과거 판매 데이터, 계절성, 프로모션 이력
- **출력**: 향후 주/월별 수요 예측값

#### 이상 탐지 (Anomaly Detection)
- **대상**: 
  - 매출 급감 감지
  - 근태 이상 패턴 탐지
  - 재고 변동 이상 탐지
- **방법**: Isolation Forest, LSTM Autoencoder, 또는 통계적 방법 (Z-score)

### 데이터 품질 검증

- **도구**: Great Expectations, Monte Carlo (선택)
- **검증 항목**: [데이터 품질 검증 체크리스트](./data-quality-checklist.md) 참고
- **실행 주기**: 일별/주별 배치 작업

---

## 리포트 템플릿

### 월간 HQ 요약 리포트

**대상**: HQ 운영 관리자  
**주기**: 월별  
**내용**:
- 근태/재고/매출 KPI 요약
- 지점별 종합 점수
- 알람 현황 및 대응 시간
- 주요 이슈 및 개선 사항

### 매장별 대시보드

**대상**: 지점 점장  
**주기**: 실시간  
**내용**:
- 실시간 근태 상태
- 재고 경보 및 리오더 추천
- 당일 매출 및 목표 대비 달성률
- 승인 대기 건수 (근태, 발주)

### 캠페인 리포트

**대상**: 마케팅 팀, HQ 운영팀  
**주기**: 프로모션 종료 후  
**내용**:
- 프로모션별 매출 기여도
- ROI 분석
- 증분 매출 계산
- 고객 반응 분석

### 주간 성과 리포트

**대상**: 지점 점장, HQ 운영팀  
**주기**: 주별  
**내용**:
- 주간 KPI 요약
- 전주 대비 성장률
- 주요 이슈 및 액션 아이템

---

## 거버넌스

### 데이터 카탈로그

- **도구**: Amundsen/OpenMetadata
- **관리 항목**:
  - 데이터 소스 메타데이터
  - 스키마 정의
  - 데이터 계보 (Lineage)
  - 사용자 주석 및 태그

### 접근 제어

- **Row-Level Security**: 지점별 데이터 접근 제한
- **Column Masking**: PII 데이터 마스킹 (예: 직원 이메일, 전화번호)
- **역할 기반 접근**: HQ 관리자, 점장, 직원별 권한 분리

### 감사 로그

- **쿼리 사용량**: 누가 어떤 데이터를 조회했는지 기록
- **리포트 접근 기록**: 대시보드 및 리포트 접근 이력
- **데이터 변경 이력**: ETL 작업 및 스키마 변경 이력

### 데이터 보존 정책

- **Hot 데이터**: 최근 3개월 (실시간 조회)
- **Warm 데이터**: 3개월~1년 (배치 조회)
- **Cold 데이터**: 1년 이상 (아카이빙, S3 Glacier)

---

## 구현 우선순위

### Phase 1 (MVP)
1. 기본 KPI 계산 및 집계
2. HQ 운영 관리자 대시보드 - Overview KPI Cards
3. 지점 점장 대시보드 - 오늘의 KPI Cards
4. 데이터 품질 검증 체크리스트 초안

### Phase 2
1. 차트 및 그래프 시각화
2. 지점별 비교 분석
3. 프로모션 ROI 분석
4. 데이터 파이프라인 구축 (Kafka, ETL)

### Phase 3
1. 고급 분석 대시보드
2. 예측 모델 통합 (수요 예측, 이상 탐지)
3. 커스텀 리포트 생성
4. 데이터 카탈로그 구축

---

## 참고 문서

- **KPI 정의**: [KPI Matrix](./kpi-matrix.md)
- **대시보드 와이어프레임**: [대시보드 와이어프레임](./dashboard-wireframes.md)
- **데이터 품질 검증**: [데이터 품질 검증 체크리스트](./data-quality-checklist.md)
- **SPEC**: `../../SPEC.md`
- **평가 연동**: `../../evaluations/README.md`
