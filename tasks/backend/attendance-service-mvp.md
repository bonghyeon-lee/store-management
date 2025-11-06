---
title: "[Backend] 근태 서비스 MVP 기능 구현"
owner: backend-team
status: in-progress
priority: high
due: 2025-12-05
related_prompts:
  - ../prompts/backend-service-brief.md
---

## 목적

SPEC.md의 M0 MVP 스코프에 따라 근태 서비スの 핵심 기능을 구현합니다. 직원의 출퇴근 기록을 관리하고, 점장의 승인 워크플로를 지원하며, 기본적인 근태 리포트를 제공합니다.

## 완료 기준

### 1. 직원 기본 정보 관리 (CRUD)

- [x] GraphQL Schema 정의 (Employee 타입, Query/Mutation)
- [x] Employee 엔티티 및 데이터베이스 모델 구현
- [x] 직원 생성 (CreateEmployee) Mutation 구현
- [x] 직원 조회 (GetEmployee, ListEmployees) Query 구현
- [x] 직원 정보 수정 (UpdateEmployee) Mutation 구현
- [x] 직원 삭제/비활성화 (DeleteEmployee) Mutation 구현
- [x] 입력 값 검증 및 에러 처리

### 2. 출퇴근 기록 입력 및 조회

- [x] AttendanceRecord 엔티티 및 데이터베이스 모델 구현
- [x] 출근 기록 입력 (CheckIn) Mutation 구현
- [x] 퇴근 기록 입력 (CheckOut) Mutation 구현
- [x] 출퇴근 기록 조회 (GetAttendanceRecord, ListAttendanceRecords) Query 구현
- [x] 직원별, 기간별 필터링 지원
- [x] 근무 시간 자동 계산 로직 구현

### 3. 근태 승인 워크플로 (점장 승인)

- [x] AttendanceRecord에 status 필드 추가 (pending, approved, rejected)
- [x] 근태 승인 요청 상태 관리
- [x] 점장 권한 확인 미들웨어 구현 (Auth Guard 및 Permission Guard 구현 완료)
- [x] 근태 승인 (ApproveAttendance) Mutation 구현
- [x] 근태 거부 (RejectAttendance) Mutation 구현
- [x] 승인 대기 목록 조회 (GetPendingApprovals) Query 구현
- [x] 승인 이력 추적 (데이터베이스에 저장됨)

### 4. 간단한 근태 리포트 (일별/주별)

- [x] 일별 근태 집계 Query 구현
  - 출근률, 지각 건수, 결근 건수
  - 직원별 근무 시간 합계
- [x] 주별 근태 집계 Query 구현
  - 주간 출근률, 평균 근무 시간
  - 지점별 통계
- [x] 리포트 데이터 포맷팅 및 반환

## 산출물

- NestJS 기반 Attendance 서비스 코드
- GraphQL Schema 정의 파일 (attendance.graphql)
- 데이터베이스 마이그레이션 파일
- API 문서 및 테스트 코드

## 검증

- [ ] 단위 테스트 작성 (서비스 로직) - TypeORM Mock 필요
- [ ] 통합 테스트 작성 (GraphQL Resolver) - TypeORM Mock 필요
- [ ] E2E 테스트 작성 (전체 워크플로)
- [x] GraphQL Schema 검증 (Apollo Studio) - 스키마 자동 생성 확인
- [ ] 코드 리뷰 완료

## 완료 일자

2025-01-27

## 구현 내용 요약

- **TypeORM 데이터베이스 연동**: `backend/attendance-service/src/modules/app.module.ts`
  - PostgreSQL 연결 설정
  - synchronize 옵션으로 자동 스키마 생성 (개발 환경)
  
- **데이터베이스 엔티티**: 
  - `backend/attendance-service/src/entities/employee.entity.ts` - Employee 엔티티
  - `backend/attendance-service/src/entities/attendance.entity.ts` - Attendance 엔티티
  
- **TypeORM Repository 사용**:
  - `backend/attendance-service/src/resolvers/employee.resolver.ts` - Employee CRUD
  - `backend/attendance-service/src/resolvers/attendance.resolver.ts` - Attendance CRUD
  - `backend/attendance-service/src/resolvers/report.resolver.ts` - 리포트 생성
  
- **주요 변경사항**:
  - 인메모리 Map 저장소를 PostgreSQL 데이터베이스로 교체
  - 모든 Resolver를 async/await 패턴으로 변경
  - 엔티티와 GraphQL 모델 간 매핑 함수 추가
  
- **권한 체크 구현**:
  - `backend/attendance-service/src/guards/auth.guard.ts` - JWT 토큰 검증
  - `backend/attendance-service/src/guards/permission.guard.ts` - 권한 및 역할 기반 접근 제어
  - 근태 승인/거부 Mutation에 `@UseGuards` 및 `@RequirePermissions` 적용
  - 지점별 접근 권한 검증 (HQ_ADMIN은 모든 지점, STORE_MANAGER는 자신의 지점만)

## 참고사항

- GPS/비콘 기반 자동 검증은 M1에서 구현 예정
- 초과근무 승인은 M0에서 제외, M1에서 구현 예정
- 실시간 Subscription은 M1에서 구현 예정
