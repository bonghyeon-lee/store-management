---
title: "[Backend] 알림 서비스 MVP 기능 구현"
owner: backend-team
status: todo
priority: medium
due: 2025-12-05
related_prompts:
  - ../prompts/backend-service-brief.md
---

## 목적

SPEC.md의 M0 MVP 스코프에 따라 알림 서비스의 기본 기능을 구현합니다. 이벤트 기반 알림 발송, 알림 템플릿 관리, 알림 이력 조회를 지원합니다.

## 완료 기준

### 1. 이벤트 기반 알림 발송 (이메일)

- [ ] GraphQL Schema 정의 (Notification 타입, Mutation)
- [ ] Notification 엔티티 및 데이터베이스 모델 구현
- [ ] 이벤트 리스너 구현 (이벤트 기반 알림 트리거)
- [ ] 이메일 발송 기능 구현
  - SMTP 서버 연동
  - 이메일 템플릿 적용
- [ ] 알림 발송 (SendNotification) Mutation 구현
- [ ] 알림 발송 큐 시스템 구현 (비동기 처리)
- [ ] 발송 실패 시 재시도 로직 구현

### 2. 알림 템플릿 관리

- [ ] NotificationTemplate 엔티티 및 데이터베이스 모델 구현
- [ ] 템플릿 생성 (CreateTemplate) Mutation 구현
- [ ] 템플릿 조회 (GetTemplate, ListTemplates) Query 구현
- [ ] 템플릿 수정 (UpdateTemplate) Mutation 구현
- [ ] 템플릿 삭제 (DeleteTemplate) Mutation 구현
- [ ] 템플릿 변수 치환 로직 구현 (예: {storeName}, {amount})
- [ ] 기본 템플릿 제공 (무단결근, 재고 부족, 매출 급감 등)

### 3. 알림 이력 조회

- [ ] 알림 이력 조회 (GetNotificationHistory) Query 구현
- [ ] 알림 상태 필터링 (sent, failed, pending)
- [ ] 수신자별, 이벤트 타입별 필터링 지원
- [ ] 알림 상세 조회 (GetNotification) Query 구현
- [ ] 알림 통계 조회 (GetNotificationStats) Query 구현
  - 발송 성공률, 실패율
  - 일별/주별 발송 통계

## 산출물

- NestJS 기반 Notification 서비스 코드
- GraphQL Schema 정의 파일
- 이메일 템플릿 파일
- 이벤트 연동 문서
- API 문서 및 테스트 코드

## 검증

- [ ] 단위 테스트 작성 (서비스 로직, 템플릿 처리)
- [ ] 통합 테스트 작성 (GraphQL Resolver, 이메일 발송)
- [ ] E2E 테스트 작성 (전체 워크플로)
- [ ] 이메일 발송 실제 테스트 (테스트 계정)
- [ ] GraphQL Schema 검증 (Apollo Studio)
- [ ] 코드 리뷰 완료

## 참고사항

- 슬랙, SMS 연동은 M1에서 구현 예정
- 실시간 알림 (WebSocket)은 M1에서 구현 예정
- 알림 우선순위 및 스로틀링은 M1에서 구현 예정
- 이벤트 소싱 패턴은 향후 검토 예정
