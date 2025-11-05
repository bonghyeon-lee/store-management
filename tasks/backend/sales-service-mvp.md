---
title: "[Backend] 매출 서비스 MVP 기능 구현"
owner: backend-team
status: todo
priority: high
due: 2025-12-05
related_prompts:
  - ../prompts/backend-service-brief.md
---

## 목적

SPEC.md의 M0 MVP 스코프에 따라 매출 서비스의 핵심 기능을 구현합니다. 매출 데이터 입력 및 조회, 일별/주별/월별 집계, 기본 매출 대시보드 데이터를 제공합니다.

## 완료 기준

### 1. 매출 데이터 입력 및 조회

- [ ] GraphQL Schema 정의 (SalesOrder 타입, Query/Mutation)
- [ ] SalesOrder 엔티티 및 데이터베이스 모델 구현
  - orderId, storeId, totalAmount, channel, settledAt 필드
- [ ] 매출 데이터 입력 (RecordSalesBatch) Mutation 구현
  - 단일 또는 배치 입력 지원
- [ ] 매출 조회 (GetSalesOrder, ListSalesOrders) Query 구현
- [ ] 지점별, 기간별, 채널별 필터링 지원
- [ ] 입력 데이터 검증 및 에러 처리

### 2. 일별/주별/월별 매출 집계

- [ ] 일별 매출 집계 Query 구현 (GetDailySales)
  - 지점별 일별 매출 합계
  - 채널별 일별 매출 분류
  - 평균 거래액, 거래 건수
- [ ] 주별 매출 집계 Query 구현 (GetWeeklySales)
  - 주간 매출 합계 및 트렌드
  - 전주 대비 증감률 계산
- [ ] 월별 매출 집계 Query 구현 (GetMonthlySales)
  - 월간 매출 합계 및 트렌드
  - 전월 대비 증감률 계산
- [ ] 집계 성능 최적화 (인덱스, 캐싱 전략)

### 3. 기본 매출 대시보드 (지점별, 기간별)

- [ ] 대시보드 데이터 조회 Query 구현 (GetSalesDashboard)
  - 전체 지점 요약 통계
  - 지점별 상위/하위 성과 지점
  - 기간별 매출 트렌드
  - 채널별 매출 분포
- [ ] KPI 계산 (총 매출, 평균 매출, 거래 건수)
- [ ] 데이터 포맷팅 및 반환 (프론트엔드에서 바로 사용 가능한 형태)

## 산출물

- NestJS 기반 Sales 서비스 코드
- GraphQL Schema 정의 파일 (sales.graphql)
- 데이터베이스 마이그레이션 파일
- 집계 쿼리 최적화 문서
- API 문서 및 테스트 코드

## 검증

- [ ] 단위 테스트 작성 (서비스 로직, 집계 로직)
- [ ] 통합 테스트 작성 (GraphQL Resolver)
- [ ] E2E 테스트 작성 (전체 워크플로)
- [ ] 성능 테스트 (대용량 데이터 집계)
- [ ] GraphQL Schema 검증 (Apollo Studio)
- [ ] 코드 리뷰 완료

## 참고사항

- 외부 POS 통합은 M2에서 구현 예정
- 실시간 스트리밍은 M1에서 구현 예정
- AI 기반 예측 모델은 M3에서 구현 예정
- TimescaleDB/ClickHouse 마이그레이션은 M1에서 검토 예정
