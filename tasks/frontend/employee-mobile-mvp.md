---
title: "[Frontend] 직원 모바일 앱/PWA MVP 구현"
owner: frontend-team
status: todo
priority: high
due: 2025-12-20
related_prompts:
  - ../prompts/frontend-wireframes.md
---

## 목적

SPEC.md의 M0 MVP 스코프에 따라 현장 직원을 위한 모바일 앱 또는 PWA를 구현합니다. 출퇴근 기록, 재고 실사 입력, 판매 활동을 수행할 수 있는 인터페이스를 제공합니다.

## 완료 기준

### 1. 출퇴근 기록

- [ ] 출퇴근 메인 화면 구현
- [ ] 출근 체크인 버튼 및 기능
- [ ] 퇴근 체크아웃 버튼 및 기능
- [ ] 근무 시간 표시 컴포넌트
- [ ] 근태 승인 대기 상태 표시
- [ ] GraphQL Mutation 연동 (CheckIn, CheckOut)
- [ ] 오프라인 지원 (PWA Service Worker)

### 2. 재고 실사 입력

- [ ] 재고 실사 메인 화면 구현
- [ ] 재고 실사 입력 폼 컴포넌트
  - 스캔 또는 수동 입력 지원
- [ ] 재고량 입력 인터페이스
- [ ] 실사 완료 및 제출 기능
- [ ] GraphQL Mutation 연동 (SubmitInventoryCount)
- [ ] 오프라인 입력 및 동기화

### 3. 판매 활동

- [ ] 판매 활동 메인 화면 구현
- [ ] 프로모션 정보 확인 컴포넌트
- [ ] 프로모션 적용 기능 (기본 구조)
- [ ] 판매 데이터 입력 폼 (필요 시)
- [ ] GraphQL Query/Mutation 연동

### 4. 고객 이벤트 기록

- [ ] 고객 이벤트 기록 화면 구현
- [ ] 이벤트 입력 폼 컴포넌트
- [ ] 이벤트 이력 조회 기능
- [ ] GraphQL Mutation 연동

### 5. PWA 기본 기능

- [ ] Service Worker 구현
- [ ] 오프라인 지원
- [ ] 앱 설치 프롬프트
- [ ] 푸시 알림 기본 구조 (M1에서 실제 구현)
- [ ] 반응형 모바일 디자인

## 산출물

- React 컴포넌트 코드 (모바일 최적화)
- PWA 설정 파일 (manifest.json, service worker)
- GraphQL 쿼리/뮤테이션 정의
- 모바일 UI 컴포넌트 문서
- 사용자 가이드 문서

## 검증

- [ ] 컴포넌트 단위 테스트 작성
- [ ] 통합 테스트 작성 (GraphQL 연동)
- [ ] 모바일 디바이스 테스트 (iOS/Android)
- [ ] PWA 기능 테스트 (오프라인, 설치)
- [ ] 접근성 테스트 (a11y)
- [ ] 성능 테스트 (로딩 시간, 오프라인 동기화)
- [ ] 코드 리뷰 완료

## 참고사항

- GPS/비콘 기반 자동 체크인은 M1에서 구현 예정
- 바코드 스캔 기능은 M1에서 구현 예정
- 네이티브 앱 전환은 향후 검토 예정
