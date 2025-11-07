---
title: "[Backend] 재고 서비스 MVP 기능 구현"
owner: backend-team
status: in-progress
priority: high
due: 2025-12-05
related_prompts:
  - ../prompts/backend-service-brief.md
---

## 목적

SPEC.md의 M0 MVP 스코프에 따라 재고 서비스의 핵심 기능을 구현합니다. SKU 관리, 재고 실사 입력, 안전재고 기반 리오더 추천, 발주 및 입고 처리를 지원합니다.

## 완료 기준

### 1. SKU 기본 정보 관리

- [x] GraphQL Schema 정의 (Product/SKU 타입, Query/Mutation)
- [x] Product/SKU 엔티티 및 데이터베이스 모델 구현
- [x] SKU 생성 (CreateSKU) Mutation 구현
- [x] SKU 조회 (GetSKU, ListSKUs) Query 구현
- [x] SKU 정보 수정 (UpdateSKU) Mutation 구현
- [x] SKU 삭제/비활성화 (DeleteSKU) Mutation 구현
- [x] SKU 기본 정보 (이름, 설명, 단가 등) 관리

### 2. 재고 실사 입력 및 조회

- [x] InventoryItem 엔티티 및 데이터베이스 모델 구현
  - storeId, skuId, quantityOnHand, lastAuditAt 필드
- [x] 재고 실사 입력 (SubmitInventoryCount) Mutation 구현
- [x] 지점별 재고 조회 (GetStoreInventory, ListStoreInventories) Query 구현
- [x] SKU별 재고 조회 (GetSKUInventory) Query 구현
- [x] 재고 실사 이력 조회 (GetInventoryAuditHistory) Query 구현
- [x] 실사 입력 검증 및 에러 처리

### 3. 안전재고 임계치 설정 및 리오더 추천

- [x] InventoryItem에 reorderPoint 필드 추가
- [x] 안전재고 임계치 설정 (SetReorderPoint) Mutation 구현
- [x] 리오더 추천 로직 구현
  - quantityOnHand <= reorderPoint 조건 확인
  - 추천 수량 계산 (안전재고 기준)
- [x] 리오더 추천 목록 조회 (GetReorderRecommendations) Query 구현
  - 지점별, SKU별 필터링 지원
- [x] 추천 품목 우선순위 계산 (재고 부족 정도 기준)

### 4. 발주 요청 및 입고 처리 기본 기능

- [x] PurchaseOrder 엔티티 및 데이터베이스 모델 구현
- [x] 발주 요청 생성 (CreatePurchaseOrder) Mutation 구현
- [x] 발주 요청 조회 (GetPurchaseOrder, ListPurchaseOrders) Query 구현
- [x] 발주 승인/거부 (ApprovePurchaseOrder, RejectPurchaseOrder) Mutation 구현
- [x] 입고 처리 (ReceiveInventory) Mutation 구현
  - 발주와 연결된 입고 처리
  - 재고 자동 업데이트
- [x] 발주 상태 관리 (pending, approved, rejected, received)

## 산출물

- NestJS 기반 Inventory 서비스 코드
- GraphQL Schema 정의 파일 (inventory.graphql)
- 데이터베이스 마이그레이션 파일
- API 문서 및 테스트 코드

## 검증

- [ ] 단위 테스트 작성 (서비스 로직, 리오더 추천 알고리즘) - TypeORM Mock 필요
- [ ] 통합 테스트 작성 (GraphQL Resolver) - TypeORM Mock 필요
- [ ] E2E 테스트 작성 (전체 워크플로)
- [x] GraphQL Schema 검증 (Apollo Studio) - 스키마 자동 생성 확인
- [ ] 코드 리뷰 완료

## 완료 일자

2025-01-27

## 구현 내용 요약

- **TypeORM 데이터베이스 연동**: `backend/inventory-service/src/modules/app.module.ts`
  - PostgreSQL 연결 설정
  - synchronize 옵션으로 자동 스키마 생성 (개발 환경)
  
- **데이터베이스 엔티티**: 
  - `backend/inventory-service/src/entities/product.entity.ts` - Product 엔티티
  - `backend/inventory-service/src/entities/inventory-item.entity.ts` - InventoryItem 엔티티
  - `backend/inventory-service/src/entities/inventory-audit.entity.ts` - InventoryAudit 엔티티
  - `backend/inventory-service/src/entities/purchase-order.entity.ts` - PurchaseOrder 엔티티
  
- **TypeORM Repository 사용**:
  - `backend/inventory-service/src/resolvers/product.resolver.ts` - Product CRUD
  - `backend/inventory-service/src/resolvers/inventory.resolver.ts` - Inventory CRUD 및 리오더 추천
  - `backend/inventory-service/src/resolvers/purchase-order.resolver.ts` - PurchaseOrder CRUD 및 입고 처리
  
- **주요 변경사항**:
  - 인메모리 Map 저장소를 PostgreSQL 데이터베이스로 교체
  - 모든 Resolver를 async/await 패턴으로 변경
  - 엔티티와 GraphQL 모델 간 매핑 함수 추가
  - DataLoader를 ProductRepository를 사용하는 방식으로 변경

## 참고사항

- 외부 POS 연동은 M2에서 구현 예정
- 고급 수요 예측 알고리즘은 M3에서 구현 예정
- 배치 처리 및 자동화는 M1에서 구현 예정
