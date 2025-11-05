---
title: "[Backend] 인증/인가 서비스 MVP 기능 구현"
owner: backend-team
status: todo
priority: high
due: 2025-12-05
related_prompts:
  - ../prompts/backend-service-brief.md
---

## 목적

SPEC.md의 M0 MVP 스코프에 따라 인증/인가 서비스의 기본 기능을 구현합니다. JWT 기반 사용자 인증, 역할 기반 접근 제어(RBAC), HQ 관리자/점장/직원 권한 분리를 지원합니다.

## 완료 기준

### 1. 기본 사용자 인증 (JWT)

- [ ] GraphQL Schema 정의 (Auth 타입, Query/Mutation)
- [ ] User 엔티티 및 데이터베이스 모델 구현
- [ ] 사용자 등록 (RegisterUser) Mutation 구현
- [ ] 로그인 (Login) Mutation 구현
  - JWT Access Token 발급
  - Refresh Token 발급 및 관리
- [ ] 토큰 갱신 (RefreshToken) Mutation 구현
- [ ] 로그아웃 (Logout) Mutation 구현
- [ ] 현재 사용자 정보 조회 (GetCurrentUser) Query 구현
- [ ] 비밀번호 해싱 및 검증 (bcrypt)

### 2. 역할 기반 접근 제어 (RBAC)

- [ ] Role 엔티티 및 데이터베이스 모델 구현
- [ ] Permission 엔티티 및 데이터베이스 모델 구현
- [ ] 역할-권한 매핑 테이블 구현
- [ ] 기본 역할 정의 (HQ_ADMIN, STORE_MANAGER, EMPLOYEE)
- [ ] 권한 확인 미들웨어 구현
  - GraphQL Resolver 레벨 권한 체크
  - JWT 토큰에서 역할 추출
- [ ] 역할 할당 (AssignRole) Mutation 구현
- [ ] 역할 조회 (GetRoles, GetUserRoles) Query 구현

### 3. HQ 관리자 / 점장 / 직원 권한 분리

- [ ] HQ 관리자 권한 정의
  - 모든 지점 데이터 접근
  - 정책 설정 및 변경
  - 전체 리포트 조회
- [ ] 점장 권한 정의
  - 할당된 지점 데이터 접근
  - 근태 승인, 재고 발주 승인
  - 지점 리포트 조회
- [ ] 직원 권한 정의
  - 본인 데이터 접근
  - 출퇴근 기록 입력
  - 재고 실사 입력
- [ ] Field Level Authorization 기본 구조 구현
- [ ] 권한 테스트 케이스 작성

## 산출물

- NestJS 기반 Auth 서비스 코드
- GraphQL Schema 정의 파일
- JWT 토큰 관리 로직
- 권한 매트릭스 문서
- 데이터베이스 마이그레이션 파일
- API 문서 및 테스트 코드

## 검증

- [ ] 단위 테스트 작성 (인증 로직, 권한 체크)
- [ ] 통합 테스트 작성 (GraphQL Resolver, JWT 검증)
- [ ] E2E 테스트 작성 (전체 인증/인가 워크플로)
- [ ] 보안 테스트 (토큰 탈취, 권한 우회 시나리오)
- [ ] GraphQL Schema 검증 (Apollo Studio)
- [ ] 코드 리뷰 완료

## 참고사항

- OIDC 기반 SSO는 M1에서 구현 예정
- Keycloak/Cognito 연동은 M2에서 구현 예정
- ABAC (Attribute-Based Access Control)는 향후 검토 예정
- 감사 로그 상세 기능은 M1에서 구현 예정
