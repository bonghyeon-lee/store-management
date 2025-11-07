---
title: "[Backend] Gateway 서비스 MVP 구현"
owner: backend-team
status: in-progress
priority: high
due: 2025-12-05
related_prompts:
  - ../prompts/backend-service-brief.md
---

## 목적

SPEC.md의 M0 MVP 스코프에 따라 Apollo Federation Gateway를 구현합니다. 각 마이크로서비스의 GraphQL Subgraph를 통합하고, 인증/인가 미들웨어와 기본적인 Observability 인터셉터를 포함합니다.

## 완료 기준

### 1. Apollo Federation Gateway 설정

- [x] Gateway 서비스 기본 구조 구현
- [x] Apollo Federation Gateway 설정
- [x] 각 Subgraph 서비스 연결
  - Attendance 서비스
  - Inventory 서비스
  - Sales 서비스
  - Notification 서비스
  - Auth 서비스
- [x] Federation 스키마 통합 및 검증
- [x] Gateway 헬스 체크 엔드포인트 구현

### 2. 인증/인가 미들웨어

- [x] JWT 토큰 검증 미들웨어 구현
- [x] 요청 컨텍스트에 사용자 정보 주입
- [x] 권한 체크 미들웨어 구현 (역할 기반)
- [x] Field Level Authorization 기본 구조
- [x] 인증 실패 시 에러 처리

### 3. Observability 인터셉터

- [x] 요청 로깅 인터셉터 구현
  - 요청 ID 생성
  - 구조화된 로그 출력
- [x] 응답 시간 측정
- [x] 에러 로깅 및 추적
- [x] 기본 메트릭 수집 (향후 확장) - 구조화된 로그 기반

### 4. CORS 및 보안 설정

- [x] CORS 설정 (프론트엔드 도메인 허용)
- [x] Rate Limiting 기본 설정
- [x] 보안 헤더 설정 (Helmet)
- [x] GraphQL Introspection 제어 (프로덕션)

### 5. 에러 처리 및 검증

- [x] GraphQL 에러 포맷팅
- [x] 입력 값 검증 에러 처리
- [x] 서비스 간 통신 에러 처리
- [x] 사용자 친화적 에러 메시지

## 산출물

- NestJS 기반 Gateway 서비스 코드
- Federation 스키마 통합 문서
- 미들웨어 설정 문서
- API 문서

## 검증

- [ ] 단위 테스트 작성 (미들웨어, 인터셉터)
- [ ] 통합 테스트 작성 (Federation 통합)
- [ ] E2E 테스트 작성 (전체 요청 흐름)
- [ ] Federation 스키마 검증 (Apollo Studio)
- [ ] 성능 테스트 (응답 시간)
- [ ] 코드 리뷰 완료

## 구현 내용 요약

### 완료된 작업 (2025-01-27)

1. **Apollo Federation Gateway 설정**
   - Gateway 서비스 기본 구조 구현 완료
   - Apollo Federation Gateway 설정 완료
   - 모든 Subgraph 서비스 연결 (Attendance, Inventory, Sales, Notification, Auth)
   - Federation 스키마 통합 및 검증
   - Gateway 헬스 체크 엔드포인트 구현 (`/health`, `/healthz`)

2. **인증/인가 미들웨어**
   - JWT 토큰 검증 미들웨어 구현 (`auth.middleware.ts`)
   - 요청 컨텍스트에 사용자 정보 주입 (userId, role, storeIds)
   - 권한 체크 미들웨어 구현 (역할 기반, `requireRole` 함수)
   - Field Level Authorization 기본 구조 (요청 컨텍스트에 사용자 정보 포함)
   - 인증 실패 시 에러 처리 (토큰 만료, 유효하지 않은 토큰 등)

3. **Observability 인터셉터**
   - 요청 로깅 인터셉터 구현 (`observability.middleware.ts`)
     - 요청 ID 생성 (UUID)
     - 구조화된 로그 출력 (JSON 형식)
   - 응답 시간 측정
   - 에러 로깅 및 추적
   - 기본 메트릭 수집 (구조화된 로그 기반)

4. **CORS 및 보안 설정**
   - CORS 설정 (프론트엔드 도메인 허용, 환경 변수로 설정 가능)
   - Rate Limiting 기본 설정 (15분당 100개 요청)
   - 보안 헤더 설정 (Helmet)
   - GraphQL Introspection 제어 (프로덕션 환경)

5. **에러 처리 및 검증**
   - GraphQL 에러 포맷팅 (확장 가능한 에러 코드, 타임스탬프)
   - 입력 값 검증 에러 처리
   - 서비스 간 통신 에러 처리
   - 사용자 친화적 에러 메시지 (한국어)

### 주요 구현 파일

- `backend/gateway-service/src/index.ts` - Gateway 메인 진입점
- `backend/gateway-service/src/middleware/auth.middleware.ts` - 인증/인가 미들웨어
- `backend/gateway-service/src/middleware/observability.middleware.ts` - 관측성 미들웨어
- `backend/gateway-service/src/middleware/security.middleware.ts` - 보안 미들웨어

### 남은 작업

- 테스트 작성 (단위 테스트, 통합 테스트, E2E 테스트)
- Federation 스키마 검증 (Apollo Studio)
- 성능 테스트 (응답 시간)
- 코드 리뷰

## 참고사항

- OpenTelemetry 트레이싱은 M1에서 구현 예정
- 고급 Rate Limiting은 M1에서 구현 예정
- 캐싱 전략은 M1에서 구현 예정
- mTLS는 M1에서 구현 예정
