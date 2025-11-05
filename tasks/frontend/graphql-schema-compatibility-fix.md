---
title: "[Frontend] GraphQL 스키마 호환성 수정 작업"
owner: frontend-team
status: todo
priority: high
due: 2025-12-15
related_prompts:
  - ../prompts/graphql-contract-review.md
---

## 목적

Gateway의 실제 통합 GraphQL 스키마와 프론트엔드에서 사용하는 쿼리/뮤테이션 이름이 일치하지 않아 발생하는 에러를 수정합니다. Gateway가 실제로 노출하는 스키마를 확인하고, 프론트엔드의 모든 GraphQL 쿼리를 실제 스키마와 일치하도록 수정합니다.

## 문제 상황

다음 GraphQL 쿼리들이 Gateway의 통합 스키마에 존재하지 않아 에러가 발생:

1. `employees` 쿼리 - Query 타입에 존재하지 않음
2. `attendanceRecords` 쿼리 - Query 타입에 존재하지 않음 (에러 메시지: "Did you mean \"attendance\"?")
3. `pendingApprovals` 쿼리 - Query 타입에 존재하지 않음
4. `dailyAttendanceReport` 쿼리 - Query 타입에 존재하지 않음
5. `weeklyAttendanceReport` 쿼리 - Query 타입에 존재하지 않음

## 완료 기준

### 1. Gateway 통합 스키마 확인

- [ ] Gateway 서비스 실행 확인
- [ ] GraphQL Introspection 쿼리로 실제 스키마 확인
- [ ] 실제 사용 가능한 쿼리 목록 문서화
- [ ] 실제 사용 가능한 타입 및 필드 문서화

### 2. Employee 관련 쿼리 수정

- [ ] `employees` 쿼리 대체 방법 확인
  - 실제 사용 가능한 쿼리 이름 확인
  - 또는 직접 Attendance 서비스 호출 필요 여부 확인
- [ ] `employee(id)` 쿼리 수정
- [ ] `createEmployee` mutation 수정
- [ ] `updateEmployee` mutation 수정
- [ ] `deleteEmployee` mutation 수정

### 3. Attendance 관련 쿼리 수정

- [ ] `attendanceRecords` 쿼리 수정
  - 에러 메시지에서 제안한 `attendance` 쿼리 확인
  - 또는 다른 쿼리 이름 사용
- [ ] `pendingApprovals` 쿼리 수정
  - 실제 사용 가능한 쿼리 이름 확인
- [ ] `attendance` 쿼리 (단일 조회) 확인 및 수정
- [ ] `checkIn` mutation 확인 및 수정
- [ ] `checkOut` mutation 확인 및 수정
- [ ] `approveAttendance` mutation 확인 및 수정
- [ ] `rejectAttendance` mutation 확인 및 수정
- [ ] `requestAttendanceCorrection` mutation 확인 및 수정

### 4. Attendance Report 쿼리 수정

- [ ] `dailyAttendanceReport` 쿼리 수정
  - 실제 사용 가능한 쿼리 이름 확인
- [ ] `weeklyAttendanceReport` 쿼리 수정
  - 실제 사용 가능한 쿼리 이름 확인
- [ ] 리포트 타입 및 필드 확인

### 5. 모든 페이지 쿼리 업데이트

- [ ] EmployeeListPage 쿼리 수정
- [ ] EmployeeDetailPage 쿼리 수정
- [ ] EmployeeFormPage 쿼리 수정
- [ ] AttendanceRecordsPage 쿼리 수정
- [ ] PendingApprovalsPage 쿼리 수정
- [ ] DailyAttendanceReportPage 쿼리 수정
- [ ] WeeklyAttendanceReportPage 쿼리 수정

### 6. GraphQL 쿼리 파일 업데이트

- [ ] `attendance.graphql` 파일 수정
- [ ] 실제 사용 가능한 쿼리/뮤테이션으로 업데이트
- [ ] 타입 정의 확인 및 수정

### 7. 에러 처리 개선

- [ ] 쿼리가 존재하지 않을 때의 에러 처리
- [ ] Federation 서비스별 에러 처리
- [ ] 사용자 친화적인 에러 메시지 표시

## 조사 방법

### 1. GraphQL Introspection 쿼리

Gateway 엔드포인트(`http://localhost:4000/graphql`)에서 다음 쿼리 실행:

```graphql
query IntrospectSchema {
  __schema {
    queryType {
      name
      fields {
        name
        description
        args {
          name
          type {
            name
            kind
          }
        }
        type {
          name
          kind
        }
      }
    }
    mutationType {
      name
      fields {
        name
        description
      }
    }
    types {
      name
      kind
      fields {
        name
        type {
          name
        }
      }
    }
  }
}
```

### 2. 실제 서비스 스키마 확인

각 서비스의 개별 GraphQL 엔드포인트 확인:

- Attendance Service: `http://localhost:4001/graphql`
- Inventory Service: `http://localhost:4002/graphql`
- Sales Service: `http://localhost:4003/graphql`

### 3. Gateway 로그 확인

Gateway 서비스의 시작 로그에서 통합된 스키마 정보 확인

## 예상되는 문제 및 해결책

### 문제 1: Federation 스키마 통합 이슈

**원인**: Attendance 서비스의 쿼리가 Gateway에 제대로 통합되지 않음

**해결책**:

- Attendance 서비스가 정상 실행 중인지 확인
- Gateway가 Attendance 서비스에 연결되어 있는지 확인
- Federation 설정 확인

### 문제 2: 쿼리 이름 불일치

**원인**: 스키마 파일과 실제 구현된 resolver 이름이 다름

**해결책**:

- 실제 resolver 이름 확인
- 쿼리 이름을 실제 스키마에 맞게 수정

### 문제 3: 타입 정의 불일치

**원인**: 스키마 파일의 타입 정의와 실제 구현이 다름

**해결책**:

- 실제 스키마에서 타입 확인
- 프론트엔드 타입 정의 수정

## 산출물

- GraphQL 스키마 문서 (실제 사용 가능한 쿼리/뮤테이션 목록)
- 수정된 GraphQL 쿼리 파일
- 수정된 페이지 컴포넌트
- 에러 처리 개선 코드

## 검증

- [ ] 모든 페이지에서 GraphQL 쿼리 에러 없이 동작
- [ ] 브라우저 콘솔에 GraphQL 에러 없음
- [ ] 네트워크 탭에서 GraphQL 요청 성공 확인
- [ ] 각 페이지의 기능이 정상 동작

## 참고사항

- Gateway는 Apollo Federation을 사용하여 여러 서브그래프를 통합
- 실제 통합된 스키마는 각 서브그래프의 스키마를 자동으로 결합한 결과
- 스키마 파일(`schemas/*.graphql`)과 실제 통합 스키마가 다를 수 있음
- GraphQL Introspection을 통해 실제 스키마 확인 필요

## 우선순위

1. **High**: Gateway 통합 스키마 확인 및 문서화
2. **High**: Employee 관련 쿼리 수정 (가장 많이 사용되는 기능)
3. **High**: Attendance 관련 쿼리 수정
4. **Medium**: Attendance Report 쿼리 수정
5. **Low**: 에러 처리 개선
