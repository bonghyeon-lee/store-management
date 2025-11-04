---
title: "[Frontend] Product 모델 필드명 통일 및 타입 개선"
owner: frontend-team
status: completed
priority: medium
due: 2025-01-XX
related_prompts:
  - ../../prompts/graphql-contract-review.md
---

## 목적

Product 모델의 필드명을 `price`에서 `unitPrice`로 통일하고, 타입 안전성을 개선합니다. GraphQL 스키마와 프론트엔드 타입 정의 간의 일관성을 확보합니다.

## 변경사항

### 1. Product 타입 정의 수정

- **파일**: `frontend/src/entities/product/model/types.ts`
- **변경**: `price: number` → `unitPrice: number`
- **효과**: 타입 정의를 GraphQL 스키마와 일치시킴

### 2. GraphQL 쿼리 및 Fragment 수정

- **파일**: `frontend/src/shared/api/graphql/product.graphql`
- **변경**: `price` → `unitPrice`
- **효과**: GraphQL 쿼리가 실제 스키마와 일치

### 3. HomePage 컴포넌트 수정

- **파일**: `frontend/src/pages/home/ui/HomePage.tsx`
- **변경사항**:
  - GraphQL 쿼리에서 `price` → `unitPrice`
  - 타입을 `any`에서 `Product`로 변경하여 타입 안전성 개선
  - `p.price` → `p.unitPrice`로 변경
- **효과**: 타입 안전성 향상 및 일관된 필드명 사용

## 완료 기준

- [x] Product 타입 정의에서 `unitPrice` 필드 사용
- [x] GraphQL 쿼리에서 `unitPrice` 필드 사용
- [x] 모든 컴포넌트에서 `unitPrice` 필드 사용
- [x] 타입 안전성 개선 (`any` → `Product`)

## 산출물

- 수정된 Product 타입 정의
- 수정된 GraphQL 쿼리 파일
- 수정된 HomePage 컴포넌트

## 검증

- [x] TypeScript 컴파일 에러 없음
- [x] GraphQL 쿼리가 정상 실행됨
- [x] HomePage에서 상품 목록이 정상 표시됨
- [x] 필드명이 일관되게 사용됨

## 참고사항

- 백엔드 GraphQL 스키마에서 Product 타입의 필드명이 `unitPrice`로 정의되어 있음
- 프론트엔드와 백엔드 간의 필드명 일관성을 유지하기 위해 변경
- 향후 다른 컴포넌트에서도 `unitPrice` 필드명을 사용해야 함

