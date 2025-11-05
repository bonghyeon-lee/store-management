---
title: "[Frontend] 점장 포털 MVP 구현"
owner: frontend-team
status: todo
priority: high
due: 2025-12-18
related_prompts:
  - ../prompts/frontend-wireframes.md
---

## 목적

SPEC.md의 M0 MVP 스코프에 따라 지점 점장을 위한 포털을 구현합니다. 매장별 근태 승인, 재고 발주, 일별 매출 점검 및 개선 액션을 수행할 수 있는 인터페이스를 제공합니다.

## 완료 기준

### 1. 근태 승인 요청 확인 및 승인/거부

- [ ] 근태 승인 대기 목록 페이지 구현
- [ ] 근태 상세 정보 표시 컴포넌트
- [ ] 승인/거부 버튼 및 액션 처리
- [ ] GraphQL Mutation 연동 (ApproveAttendance, RejectAttendance)
- [ ] 승인 이력 조회 기능

### 2. 전일 매출 데이터 검토

- [ ] 매출 대시보드 페이지 구현
- [ ] 전일 매출 요약 카드 컴포넌트
- [ ] 매출 트렌드 차트 컴포넌트
- [ ] 이상 확인 기능 (임계치 기반 알림)
- [ ] GraphQL Query 연동 (GetDailySales)

### 3. 재고 상태 확인 및 발주 필요 품목 검토

- [ ] 재고 현황 페이지 구현
- [ ] 재고 목록 테이블 컴포넌트
  - 재고 부족 품목 강조 표시
- [ ] 리오더 추천 목록 컴포넌트
- [ ] 발주 요청 생성 폼 컴포넌트
- [ ] GraphQL Query/Mutation 연동

### 4. 스케줄 확인 및 교대 조정

- [ ] 직원 스케줄 캘린더 컴포넌트
- [ ] 스케줄 조회 기능
- [ ] 교대 조정 인터페이스 (기본 구조)
- [ ] GraphQL Query 연동

### 5. 출퇴근 기록 검증

- [ ] 출퇴근 기록 목록 페이지 구현
- [ ] 기록 검증 상태 표시
- [ ] 이상 기록 필터링 기능
- [ ] GraphQL Query 연동 (ListAttendanceRecords)

### 6. 재고 실사 결과 입력 및 검증

- [ ] 재고 실사 입력 페이지 구현
- [ ] 실사 입력 폼 컴포넌트
- [ ] 실사 결과 검증 기능
- [ ] GraphQL Mutation 연동 (SubmitInventoryCount)

### 7. 입고 확인 및 재고 업데이트

- [ ] 입고 목록 페이지 구현
- [ ] 입고 확인 처리 기능
- [ ] 재고 자동 업데이트 확인
- [ ] GraphQL Mutation 연동 (ReceiveInventory)

### 8. 일별/주별 성과 리포트

- [ ] 리포트 페이지 구현
- [ ] 성과 지표 시각화
- [ ] 리포트 다운로드 기능
- [ ] GraphQL Query 연동 (GetStoreReports)

## 산출물

- React 컴포넌트 코드
- GraphQL 쿼리/뮤테이션 정의
- UI 컴포넌트 스토리북 문서
- 사용자 가이드 문서

## 검증

- [ ] 컴포넌트 단위 테스트 작성
- [ ] 통합 테스트 작성 (GraphQL 연동)
- [ ] E2E 테스트 작성 (Cypress)
- [ ] 접근성 테스트 (a11y)
- [ ] 반응형 디자인 테스트
- [ ] 코드 리뷰 완료

## 참고사항

- GPS/비콘 기반 검증 UI는 M1에서 구현 예정
- 실시간 알림은 M1에서 구현 예정
- 고급 분석 기능은 M2에서 구현 예정
