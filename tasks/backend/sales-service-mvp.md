---
title: "[Backend] 매출 서비스 MVP 기능 구현"
owner: backend-team
status: in-progress
priority: high
due: 2025-12-05
related_prompts:
  - ../prompts/backend-service-brief.md
---

## 목적

SPEC.md의 M0 MVP 스코프에 따라 매출 서비스의 핵심 기능을 구현합니다. 매출 데이터 입력 및 조회, 일별/주별/월별 집계, 기본 매출 대시보드 데이터를 제공합니다.

## 완료 기준

### 1. 매출 데이터 입력 및 조회

- [x] GraphQL Schema 정의 (SalesOrder 타입, Query/Mutation)
- [x] SalesOrder 엔티티 및 데이터베이스 모델 구현
  - orderId, storeId, totalAmount, channel, settledAt 필드
- [x] 매출 데이터 입력 (RecordSalesBatch) Mutation 구현
  - 단일 또는 배치 입력 지원
- [x] 매출 조회 (GetSalesOrder, ListSalesOrders) Query 구현
- [x] 지점별, 기간별, 채널별 필터링 지원
- [x] 입력 데이터 검증 및 에러 처리

### 2. 일별/주별/월별 매출 집계

- [x] 일별 매출 집계 Query 구현 (GetDailySales)
  - 지점별 일별 매출 합계
  - 채널별 일별 매출 분류
  - 평균 거래액, 거래 건수
- [x] 주별 매출 집계 Query 구현 (GetWeeklySales)
  - 주간 매출 합계 및 트렌드
  - 전주 대비 증감률 계산
- [x] 월별 매출 집계 Query 구현 (GetMonthlySales)
  - 월간 매출 합계 및 트렌드
  - 전월 대비 증감률 계산
- [x] 집계 성능 최적화 (인덱스, 캐싱 전략)
  - 엔티티에 인덱스 추가 (storeId, status, channel, createdAt, settledAt)

### 3. 기본 매출 대시보드 (지점별, 기간별)

- [x] 대시보드 데이터 조회 Query 구현 (GetSalesDashboard)
  - 전체 지점 요약 통계
  - 지점별 상위/하위 성과 지점
  - 기간별 매출 트렌드
  - 채널별 매출 분포
- [x] KPI 계산 (총 매출, 평균 매출, 거래 건수)
- [x] 데이터 포맷팅 및 반환 (프론트엔드에서 바로 사용 가능한 형태)

## 산출물

- NestJS 기반 Sales 서비스 코드
- GraphQL Schema 정의 파일 (sales.graphql)
- 데이터베이스 마이그레이션 파일
- 집계 쿼리 최적화 문서
- API 문서 및 테스트 코드

## 검증

- [x] 단위 테스트 작성 (서비스 로직, 집계 로직)
  - SalesService 단위 테스트 작성 완료 (17개 테스트 케이스)
  - 주문 CRUD, 매출 집계, 대시보드 로직 테스트 포함
- [x] 통합 테스트 작성 (GraphQL Resolver)
  - SalesResolver 통합 테스트 작성 완료 (10개 테스트 케이스)
  - 모든 Query/Mutation 테스트 포함
- [ ] E2E 테스트 작성 (전체 워크플로)
- [ ] 성능 테스트 (대용량 데이터 집계)
- [x] GraphQL Schema 검증 (Apollo Studio) - 스키마 자동 생성 확인
- [ ] 코드 리뷰 완료

## 구현 내용 요약

### 완료된 작업 (2025-01-27)

1. **TypeORM 엔티티 구현**
   - `OrderEntity`: 주문 엔티티 (복합 키: storeId + orderId)
   - `LineItemEntity`: 주문 항목 엔티티 (Order와 OneToMany 관계)
   - 인덱스 추가: storeId, status, channel, createdAt, settledAt

2. **데이터베이스 연동**
   - TypeORM 설정 및 PostgreSQL 연결
   - AppModule에 TypeORM 모듈 추가
   - 엔티티 자동 동기화 설정 (개발 환경)

3. **Service 레이어 구현**
   - `SalesService`: 모든 비즈니스 로직 구현
   - 주문 CRUD 작업
   - 일별/주별/월별 매출 집계
   - 대시보드 데이터 조회
   - 유틸리티 함수들 (날짜 계산 등)

4. **Resolver 업데이트**
   - 인메모리 저장소에서 TypeORM Repository로 변경
   - Service 레이어를 통한 데이터 접근
   - 모든 Query/Mutation 구현 완료

5. **의존성 추가**
   - `@nestjs/typeorm`: TypeORM 모듈
   - `typeorm`: TypeORM 라이브러리
   - `pg`: PostgreSQL 드라이버

### 남은 작업

- E2E 테스트 작성 (전체 워크플로)
- 성능 테스트 (대용량 데이터 집계)
- 코드 리뷰

### 테스트 작성 완료 (2025-01-27)

1. **SalesService 단위 테스트** (`src/services/sales.service.spec.ts`)
   - 17개 테스트 케이스 모두 통과
   - 주문 조회, 필터링, 생성, 환불 테스트
   - 일별/주별/월별 매출 집계 테스트
   - 대시보드 데이터 조회 테스트

2. **SalesResolver 통합 테스트** (`src/resolvers/sales.resolver.spec.ts`)
   - 10개 테스트 케이스 모두 통과
   - 모든 GraphQL Query/Mutation 테스트
   - Service 레이어와의 통합 검증

## 참고사항

- 외부 POS 통합은 M2에서 구현 예정
- 실시간 스트리밍은 M1에서 구현 예정
- AI 기반 예측 모델은 M3에서 구현 예정
- TimescaleDB/ClickHouse 마이그레이션은 M1에서 검토 예정
