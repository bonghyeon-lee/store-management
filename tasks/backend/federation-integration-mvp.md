---
title: "[Backend] GraphQL Federation 통합 MVP"
owner: backend-team
status: todo
priority: high
due: 2025-11-05
related_prompts:
  - ../prompts/graphql-contract-review.md
---

## 목적

SPEC.md의 M0 MVP 스코프에 따라 각 마이크로서비스의 GraphQL Subgraph를 정의하고 Federation으로 통합합니다. 서비스 간 스키마 독립성을 유지하면서 Gateway에서 통합 스키마를 제공합니다.

## 완료 기준

### 1. 각 서비스 Subgraph Schema 정의

- [ ] Attendance 서비스 GraphQL Schema 정의
  - Employee 타입
  - AttendanceRecord 타입
  - Query/Mutation 정의
  - Federation 디렉티브 (@key, @extends 등)
- [ ] Inventory 서비스 GraphQL Schema 정의
  - Product/SKU 타입
  - InventoryItem 타입
  - PurchaseOrder 타입
  - Query/Mutation 정의
- [ ] Sales 서비스 GraphQL Schema 정의
  - SalesOrder 타입
  - Query/Mutation 정의
- [ ] Notification 서비스 GraphQL Schema 정의
  - Notification 타입
  - NotificationTemplate 타입
  - Query/Mutation 정의
- [ ] Auth 서비스 GraphQL Schema 정의
  - User 타입
  - Role 타입
  - Query/Mutation 정의

### 2. Federation 스키마 통합

- [ ] Gateway에서 Subgraph 스키마 로드
- [ ] Federation 스키마 컴파일 및 검증
- [ ] 타입 확장 및 관계 정의
  - 예: Store 타입 확장, Employee-Store 관계
- [ ] 스키마 충돌 검사 및 해결

### 3. 서비스 간 데이터 조인

- [ ] DataLoader 패턴 구현 (N+1 방지)
- [ ] 서비스 간 데이터 조인 로직 구현
  - 예: Employee의 Store 정보 조회
- [ ] 캐싱 전략 적용 (기본 구조)

### 4. 스키마 버전 관리 및 검증

- [ ] 스키마 버전 관리 전략 수립
- [ ] Breaking Change 감지 도구 설정
- [ ] 스키마 레지스트리 기본 구조 (향후 확장)
- [ ] Contract 테스트 자동화 (CI/CD 통합)

### 5. 문서화

- [ ] 통합 스키마 문서 생성
- [ ] 각 서비스 Subgraph 문서
- [ ] Federation 설계 문서 작성
- [ ] 개발 가이드 작성

## 산출물

- 각 서비스 GraphQL Schema 파일
- Federation 통합 스키마
- DataLoader 구현 코드
- 스키마 검증 도구 설정
- 문서화 파일

## 검증

- [ ] Federation 스키마 컴파일 성공 확인
- [ ] Apollo Studio에서 스키마 검증
- [ ] 서비스 간 데이터 조인 테스트
- [ ] N+1 문제 해결 확인 (성능 테스트)
- [ ] Contract 테스트 실행
- [ ] 코드 리뷰 완료

## 참고사항

- Subscription은 M1에서 구현 예정
- 고급 캐싱 전략은 M1에서 구현 예정
- Schema Registry 도입은 M1에서 검토 예정
- GraphQL Inspector 통합은 M1에서 구현 예정
