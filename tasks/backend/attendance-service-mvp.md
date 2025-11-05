---
title: "[Backend] 근태 서비스 MVP 기능 구현"
owner: backend-team
status: todo
priority: high
due: 2025-12-05
related_prompts:
  - ../prompts/backend-service-brief.md
---

## 목적

SPEC.md의 M0 MVP 스코프에 따라 근태 서비スの 핵심 기능을 구현합니다. 직원의 출퇴근 기록을 관리하고, 점장의 승인 워크플로를 지원하며, 기본적인 근태 리포트를 제공합니다.

## 완료 기준

### 1. 직원 기본 정보 관리 (CRUD)

- [ ] GraphQL Schema 정의 (Employee 타입, Query/Mutation)
- [ ] Employee 엔티티 및 데이터베이스 모델 구현
- [ ] 직원 생성 (CreateEmployee) Mutation 구현
- [ ] 직원 조회 (GetEmployee, ListEmployees) Query 구현
- [ ] 직원 정보 수정 (UpdateEmployee) Mutation 구현
- [ ] 직원 삭제/비활성화 (DeleteEmployee) Mutation 구현
- [ ] 입력 값 검증 및 에러 처리

### 2. 출퇴근 기록 입력 및 조회

- [ ] AttendanceRecord 엔티티 및 데이터베이스 모델 구현
- [ ] 출근 기록 입력 (CheckIn) Mutation 구현
- [ ] 퇴근 기록 입력 (CheckOut) Mutation 구현
- [ ] 출퇴근 기록 조회 (GetAttendanceRecord, ListAttendanceRecords) Query 구현
- [ ] 직원별, 기간별 필터링 지원
- [ ] 근무 시간 자동 계산 로직 구현

### 3. 근태 승인 워크플로 (점장 승인)

- [ ] AttendanceRecord에 status 필드 추가 (pending, approved, rejected)
- [ ] 근태 승인 요청 상태 관리
- [ ] 점장 권한 확인 미들웨어 구현
- [ ] 근태 승인 (ApproveAttendance) Mutation 구현
- [ ] 근태 거부 (RejectAttendance) Mutation 구현
- [ ] 승인 대기 목록 조회 (GetPendingApprovals) Query 구현
- [ ] 승인 이력 추적

### 4. 간단한 근태 리포트 (일별/주별)

- [ ] 일별 근태 집계 Query 구현
  - 출근률, 지각 건수, 결근 건수
  - 직원별 근무 시간 합계
- [ ] 주별 근태 집계 Query 구현
  - 주간 출근률, 평균 근무 시간
  - 지점별 통계
- [ ] 리포트 데이터 포맷팅 및 반환

## 산출물

- NestJS 기반 Attendance 서비스 코드
- GraphQL Schema 정의 파일 (attendance.graphql)
- 데이터베이스 마이그레이션 파일
- API 문서 및 테스트 코드

## 검증

- [ ] 단위 테스트 작성 (서비스 로직)
- [ ] 통합 테스트 작성 (GraphQL Resolver)
- [ ] E2E 테스트 작성 (전체 워크플로)
- [ ] GraphQL Schema 검증 (Apollo Studio)
- [ ] 코드 리뷰 완료

## 참고사항

- GPS/비콘 기반 자동 검증은 M1에서 구현 예정
- 초과근무 승인은 M0에서 제외, M1에서 구현 예정
- 실시간 Subscription은 M1에서 구현 예정
