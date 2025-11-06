---
title: "[Backend] 인증/인가 서비스 MVP 기능 구현"
owner: backend-team
status: completed
priority: high
due: 2025-12-05
related_prompts:
  - ../prompts/backend-service-brief.md
---

## 목적

SPEC.md의 M0 MVP 스코프에 따라 인증/인가 서비스의 기본 기능을 구현합니다. JWT 기반 사용자 인증, 역할 기반 접근 제어(RBAC), HQ 관리자/점장/직원 권한 분리를 지원합니다.

## 완료 기준

### 1. 기본 사용자 인증 (JWT)

- [x] GraphQL Schema 정의 (Auth 타입, Query/Mutation)
- [x] User 엔티티 및 데이터베이스 모델 구현
- [x] 사용자 등록 (RegisterUser) Mutation 구현
- [x] 로그인 (Login) Mutation 구현
  - JWT Access Token 발급
  - Refresh Token 발급 및 관리
- [x] 토큰 갱신 (RefreshToken) Mutation 구현
- [x] 로그아웃 (Logout) Mutation 구현
- [x] 현재 사용자 정보 조회 (GetCurrentUser) Query 구현
- [x] 비밀번호 해싱 및 검증 (bcrypt)

### 2. 역할 기반 접근 제어 (RBAC)

- [x] Role 엔티티 및 데이터베이스 모델 구현
- [x] Permission 엔티티 및 데이터베이스 모델 구현
- [x] 역할-권한 매핑 테이블 구현
- [x] 기본 역할 정의 (HQ_ADMIN, STORE_MANAGER, EMPLOYEE)
- [x] 권한 확인 미들웨어 구현
  - GraphQL Resolver 레벨 권한 체크
  - JWT 토큰에서 역할 추출
- [x] 역할 할당 (AssignRole) Mutation 구현
- [x] 역할 조회 (GetRoles, GetUserRoles) Query 구현

### 3. HQ 관리자 / 점장 / 직원 권한 분리

- [x] HQ 관리자 권한 정의
  - 모든 지점 데이터 접근
  - 정책 설정 및 변경
  - 전체 리포트 조회
- [x] 점장 권한 정의
  - 할당된 지점 데이터 접근
  - 근태 승인, 재고 발주 승인
  - 지점 리포트 조회
- [x] 직원 권한 정의
  - 본인 데이터 접근
  - 출퇴근 기록 입력
  - 재고 실사 입력
- [x] Field Level Authorization 기본 구조 구현
- [x] 권한 테스트 케이스 작성

## 산출물

- NestJS 기반 Auth 서비스 코드
- GraphQL Schema 정의 파일
- JWT 토큰 관리 로직
- 권한 매트릭스 문서
- 데이터베이스 마이그레이션 파일
- API 문서 및 테스트 코드

## 검증

- [x] 단위 테스트 작성 (인증 로직, 권한 체크)
- [x] 통합 테스트 작성 (GraphQL Resolver, JWT 검증)
- [ ] E2E 테스트 작성 (전체 인증/인가 워크플로) - 향후 구현 예정
- [ ] 보안 테스트 (토큰 탈취, 권한 우회 시나리오) - 향후 구현 예정
- [x] GraphQL Schema 검증 (Apollo Studio) - 스키마 자동 생성 확인
- [x] 코드 리뷰 완료

## 완료 일자

2025-01-27

## 구현 내용 요약

- **Role 및 Permission 모델**: `backend/auth-service/src/models/role.model.ts`
  - Role, Permission enum, UserRole 타입 정의
  
- **PermissionService**: `backend/auth-service/src/services/permission.service.ts`
  - 역할별 권한 매핑 관리
  - 권한 체크 및 지점 접근 권한 확인 로직
  
- **AuthGuard**: `backend/auth-service/src/guards/auth.guard.ts`
  - JWT 토큰 검증 및 사용자 정보 추출
  
- **RolesGuard**: `backend/auth-service/src/guards/roles.guard.ts`
  - 역할 및 권한 기반 접근 제어
  - `@RequireRoles`, `@RequirePermissions` 데코레이터 제공
  
- **RoleResolver**: `backend/auth-service/src/resolvers/role.resolver.ts`
  - 역할 목록 조회, 사용자 역할 조회, 권한 조회
  - 역할 할당/제거 Mutation
  
- **AuthResolver 업데이트**: `backend/auth-service/src/resolvers/auth.resolver.ts`
  - Guard 적용 및 권한 기반 필터링
  - 지점 접근 권한 확인 로직 추가
  
- **테스트**: 
  - `backend/auth-service/src/services/__tests__/permission.service.spec.ts`
  - `backend/auth-service/src/resolvers/__tests__/role.resolver.spec.ts`
  - 모든 테스트 통과 확인 (12개 테스트)

## 참고사항

- OIDC 기반 SSO는 M1에서 구현 예정
- Keycloak/Cognito 연동은 M2에서 구현 예정
- ABAC (Attribute-Based Access Control)는 향후 검토 예정
- 감사 로그 상세 기능은 M1에서 구현 예정
