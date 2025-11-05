---
title: "[Backend] Gateway 서비스 MVP 구현"
owner: backend-team
status: todo
priority: high
due: 2025-12-05
related_prompts:
  - ../prompts/backend-service-brief.md
---

## 목적

SPEC.md의 M0 MVP 스코프에 따라 Apollo Federation Gateway를 구현합니다. 각 마이크로서비스의 GraphQL Subgraph를 통합하고, 인증/인가 미들웨어와 기본적인 Observability 인터셉터를 포함합니다.

## 완료 기준

### 1. Apollo Federation Gateway 설정

- [ ] Gateway 서비스 기본 구조 구현
- [ ] Apollo Federation Gateway 설정
- [ ] 각 Subgraph 서비스 연결
  - Attendance 서비스
  - Inventory 서비스
  - Sales 서비스
  - Notification 서비스
  - Auth 서비스
- [ ] Federation 스키마 통합 및 검증
- [ ] Gateway 헬스 체크 엔드포인트 구현

### 2. 인증/인가 미들웨어

- [ ] JWT 토큰 검증 미들웨어 구현
- [ ] 요청 컨텍스트에 사용자 정보 주입
- [ ] 권한 체크 미들웨어 구현
- [ ] Field Level Authorization 기본 구조
- [ ] 인증 실패 시 에러 처리

### 3. Observability 인터셉터

- [ ] 요청 로깅 인터셉터 구현
  - 요청 ID 생성
  - 구조화된 로그 출력
- [ ] 응답 시간 측정
- [ ] 에러 로깅 및 추적
- [ ] 기본 메트릭 수집 (향후 확장)

### 4. CORS 및 보안 설정

- [ ] CORS 설정 (프론트엔드 도메인 허용)
- [ ] Rate Limiting 기본 설정
- [ ] 보안 헤더 설정
- [ ] GraphQL Introspection 제어 (프로덕션)

### 5. 에러 처리 및 검증

- [ ] GraphQL 에러 포맷팅
- [ ] 입력 값 검증 에러 처리
- [ ] 서비스 간 통신 에러 처리
- [ ] 사용자 친화적 에러 메시지

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

## 참고사항

- OpenTelemetry 트레이싱은 M1에서 구현 예정
- 고급 Rate Limiting은 M1에서 구현 예정
- 캐싱 전략은 M1에서 구현 예정
- mTLS는 M1에서 구현 예정
