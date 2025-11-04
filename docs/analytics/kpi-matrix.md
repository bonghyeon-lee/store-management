# KPI Matrix (Draft)

| Domain    | KPI                       | Definition / Formula                                              | Data Source                     | Cadence | Owner              |
|-----------|---------------------------|-------------------------------------------------------------------|---------------------------------|---------|--------------------|
| 근태      | 출퇴근 준수율             | `정상 출퇴근 기록 수 / 전체 스케줄 수 * 100`                     | attendance-service (Postgres)   | Daily   | Attendance Manager |
| 근태      | 초과근무 승인율           | `승인된 초과근무 요청 / 전체 초과근무 요청 * 100`                | attendance-service (GraphQL)    | Weekly  | Store Manager      |
| 재고      | 재고 회전율               | `기간 매출원가 / 평균 재고 자산`                                 | inventory-service, sales ETL    | Weekly  | Inventory Analyst  |
| 재고      | 안전재고 준수율           | `안전재고 이상 SKU 수 / 전체 SKU 수 * 100`                       | inventory-service               | Daily   | Inventory Analyst  |
| 매출      | 일별 매출 성장률          | `(당일 매출 - 전일 매출) / 전일 매출 * 100`                       | sales-service, TimescaleDB      | Daily   | Sales Analyst      |
| 매출      | 프로모션 ROI              | `(프로모션 매출 - 프로모션 비용) / 프로모션 비용 * 100`          | sales-service, finance dataset  | Monthly | Marketing Lead     |
| 운영      | 알람 대응 시간(MTTA/MTTR) | 알람 감지부터 대응 시작/종료까지 평균                               | ops observability stack         | Weekly  | DevOps Agent       |
| 운영      | 서비스 가용성             | `(총 시간 - 다운타임) / 총 시간 * 100`                           | uptime monitoring               | Monthly | DevOps Agent       |

## Notes

- 각 KPI는 `/evaluations` 리포트에 포함되어야 하며, 기준값/목표치는 추후 워크숍에서 합의
- 데이터 품질 점검은 Great Expectations 시나리오와 연동 예정
- 추가 KPI 후보: 직원 만족도(NPS), 재고 실사 정확도, SKU별 매출 기여도
