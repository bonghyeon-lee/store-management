# Analytics Handbook

## 목적

- 근태, 재고, 매출 데이터를 통합 분석하여 지점 및 본사의 의사결정을 지원합니다.

## 데이터 파이프라인

- 이벤트 수집: Kafka → Debezium(Change Data Capture) → Data Lake (S3)
- 변환: dbt 또는 Dagster로 ETL 수행
- 저장: TimescaleDB/ClickHouse(시계열), BigQuery/Snowflake(OLAP)
- 시각화: Metabase, Superset, 혹은 Looker Studio

## KPI 정의 (초안)

- **근태**: 출퇴근 준수율, 초과근무 승인율, 결근 비율
- **재고**: 재고 회전율, 안전재고 준수율, 실사 정확도
- **매출**: 일별/주별 성장률, 프로모션 ROI, 객단가
- **운영**: SLA 달성률, 알람 대응 속도

## 모델링 전략

- 스타 스키마: Fact 테이블(`fact_attendance`, `fact_inventory`, `fact_sales`) + Dimension(`dim_store`, `dim_employee`, `dim_time`)
- 예측 모델: LSTM/Prophet 기반 수요 예측, Anomaly Detection(매출 급감, 근태 이상)
- 데이터 품질 검증: Great Expectations, Monte Carlo(선택)

## 리포트 템플릿

- 월간 HQ 요약: 근태/재고/매출 KPI, 알람 현황
- 매장별 대시보드: 실시간 근태 상태, 재고 경보, 당일 매출
- 캠페인 리포트: 프로모션별 매출 기여, ROI 분석

## 거버넌스

- 데이터 카탈로그: Amundsen/OpenMetadata
- 접근 제어: Row-Level Security, Column Masking
- 감사 로그: 쿼리 사용량, 리포트 접근 기록

## 참고

- SPEC: `../../SPEC.md`
- 평가 연동: `../../evaluations/README.md`
