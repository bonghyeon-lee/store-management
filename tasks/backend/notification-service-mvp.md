---
title: "[Backend] 알림 서비스 MVP 기능 구현"
owner: backend-team
status: in-progress
priority: medium
due: 2025-12-05
related_prompts:
  - ../prompts/backend-service-brief.md
---

## 목적

SPEC.md의 M0 MVP 스코프에 따라 알림 서비스의 기본 기능을 구현합니다. 이벤트 기반 알림 발송, 알림 템플릿 관리, 알림 이력 조회를 지원합니다.

## 완료 기준

### 1. 이벤트 기반 알림 발송 (이메일)

- [x] GraphQL Schema 정의 (Notification 타입, Mutation)
- [x] Notification 엔티티 및 데이터베이스 모델 구현
- [ ] 이벤트 리스너 구현 (이벤트 기반 알림 트리거) - 향후 다른 서비스와 통합 시 구현
- [x] 이메일 발송 기능 구현
  - [x] SMTP 서버 연동 (EmailService)
  - [x] 이메일 템플릿 적용
- [x] 알림 발송 (SendNotification) Mutation 구현
- [ ] 알림 발송 큐 시스템 구현 (비동기 처리) - MVP에서는 동기 처리, 향후 개선 예정
- [ ] 발송 실패 시 재시도 로직 구현 - MVP에서는 기본 에러 처리, 향후 개선 예정

### 2. 알림 템플릿 관리

- [x] NotificationTemplate 엔티티 및 데이터베이스 모델 구현
- [x] 템플릿 생성 (CreateTemplate) Mutation 구현
- [x] 템플릿 조회 (GetTemplate, ListTemplates) Query 구현
- [x] 템플릿 수정 (UpdateTemplate) Mutation 구현
- [x] 템플릿 삭제 (DeleteTemplate) Mutation 구현
- [x] 템플릿 변수 치환 로직 구현 (예: {storeName}, {amount})
- [x] 기본 템플릿 제공 (무단결근, 재고 부족, 매출 급감 등)
- [x] 템플릿을 사용하여 알림 발송 (SendNotificationWithTemplate) Mutation 구현

### 3. 알림 이력 조회

- [x] 알림 이력 조회 (notifications Query) 구현
- [x] 알림 상태 필터링 (sent, failed, pending)
- [x] 수신자별, 이벤트 타입별 필터링 지원
- [x] 알림 상세 조회 (notification Query) 구현
- [x] 알림 통계 조회 (notificationStats Query) 구현
  - [x] 발송 성공률, 실패율
  - [x] 일별/주별 발송 통계 (기간 필터링 지원)

## 산출물

- NestJS 기반 Notification 서비스 코드
- GraphQL Schema 정의 파일
- 이메일 템플릿 파일
- 이벤트 연동 문서
- API 문서 및 테스트 코드

## 검증

- [ ] 단위 테스트 작성 (서비스 로직, 템플릿 처리) - 향후 구현 예정
- [ ] 통합 테스트 작성 (GraphQL Resolver, 이메일 발송) - 향후 구현 예정
- [ ] E2E 테스트 작성 (전체 워크플로) - 향후 구현 예정
- [ ] 이메일 발송 실제 테스트 (테스트 계정) - 향후 구현 예정
- [x] GraphQL Schema 검증 (Apollo Studio) - 스키마 자동 생성 확인
- [ ] 코드 리뷰 완료

## 완료 일자

2025-01-27

## 구현 내용 요약

- **TypeORM 데이터베이스 연동**: `backend/notification-service/src/modules/app.module.ts`
  - PostgreSQL 연결 설정
  - synchronize 옵션으로 자동 스키마 생성 (개발 환경)
  
- **데이터베이스 엔티티**: 
  - `backend/notification-service/src/entities/notification.entity.ts` - Notification 엔티티
  - `backend/notification-service/src/entities/template.entity.ts` - NotificationTemplate 엔티티
  
- **TypeORM Repository 사용**:
  - `backend/notification-service/src/resolvers/notification.resolver.ts` - Notification 및 Template CRUD
  - 인메모리 Map 저장소를 PostgreSQL 데이터베이스로 교체
  - 모든 Resolver를 async/await 패턴으로 변경
  - 엔티티와 GraphQL 모델 간 매핑 함수 추가
  
- **EmailService**: `backend/notification-service/src/services/email.service.ts`
  - SMTP 서버 연동 (nodemailer)
  - 이메일 발송 로직 분리
  - 에러 처리 및 로깅
  
- **주요 기능**:
  - 알림 발송 (sendNotification)
  - 템플릿 기반 알림 발송 (sendNotificationWithTemplate)
  - 템플릿 CRUD (생성, 조회, 수정, 삭제)
  - 알림 이력 조회 (필터링 지원)
  - 알림 통계 조회
  - 초기 샘플 템플릿 자동 생성

## 참고사항

- 슬랙, SMS 연동은 M1에서 구현 예정
- 실시간 알림 (WebSocket)은 M1에서 구현 예정
- 알림 우선순위 및 스로틀링은 M1에서 구현 예정
- 이벤트 소싱 패턴은 향후 검토 예정
