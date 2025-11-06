---
title: "[Backend] TypeORM Mock 설정 및 테스트 유틸리티 구현"
owner: backend-team
status: todo
priority: medium
due: 2025-02-05
related_prompts:
  - ../prompts/backend-service-brief.md
---

## 목적

TypeORM Repository를 사용하는 Resolver에 대한 단위 테스트 및 통합 테스트를 작성하기 위해 TypeORM Mock 유틸리티를 구현합니다. 이를 통해 데이터베이스 연결 없이도 테스트를 실행할 수 있도록 합니다.

## 완료 기준

### 1. TypeORM Mock 유틸리티 구현

- [ ] 공통 Mock Repository 팩토리 함수 구현
  - `createMockRepository()` 함수 생성
  - 기본 CRUD 메서드 Mock 구현 (findOne, find, save, create, delete 등)
  - QueryBuilder Mock 구현
- [ ] 테스트 헬퍼 함수 구현
  - `getMockRepository()` - Mock Repository 반환
  - `getMockQueryBuilder()` - Mock QueryBuilder 반환
  - 엔티티 Mock 데이터 생성 함수
- [ ] 공통 테스트 유틸리티 파일 생성
  - `backend/attendance-service/src/test-utils/typeorm-mock.ts`
  - 다른 서비스에서도 재사용 가능하도록 공통 구조로 구현

### 2. Attendance 서비스 테스트 업데이트

- [ ] EmployeeResolver 테스트 업데이트
  - TypeORM Mock Repository 적용
  - 기존 테스트 케이스 수정 (async/await 패턴)
  - 새로운 테스트 케이스 추가 (데이터베이스 연동 시나리오)
- [ ] AttendanceResolver 테스트 업데이트
  - TypeORM Mock Repository 적용
  - 기존 테스트 케이스 수정
  - QueryBuilder Mock 테스트 추가
- [ ] ReportResolver 테스트 업데이트
  - TypeORM Mock Repository 적용
  - 복잡한 쿼리 테스트 (집계, 필터링)
- [ ] 모든 테스트 통과 확인

### 3. 다른 서비스에도 적용 준비

- [ ] Mock 유틸리티 문서화
- [ ] 사용 예시 코드 작성
- [ ] Inventory, Sales 서비스에도 동일한 패턴 적용 가능하도록 구조화

## 산출물

- TypeORM Mock 유틸리티 파일 (`backend/attendance-service/src/test-utils/typeorm-mock.ts`)
- 업데이트된 테스트 파일들
  - `backend/attendance-service/src/resolvers/employee.resolver.spec.ts`
  - `backend/attendance-service/src/resolvers/attendance.resolver.spec.ts`
  - `backend/attendance-service/src/resolvers/report.resolver.spec.ts`
- 테스트 유틸리티 사용 가이드 문서

## 검증

- [ ] 모든 테스트 케이스 통과
- [ ] 테스트 커버리지 유지 또는 향상
- [ ] 테스트 실행 시간 확인 (Mock 사용으로 빠른 실행)
- [ ] 코드 리뷰 완료

## 구현 세부사항

### Mock Repository 기본 구조

```typescript
// 예시 구조
export function createMockRepository<T>(): Repository<T> {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
    // ... 기타 필요한 메서드
  } as unknown as Repository<T>;
}
```

### QueryBuilder Mock 구조

```typescript
// QueryBuilder Mock 체이닝 지원
export function createMockQueryBuilder<T>() {
  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
    // ... 기타 QueryBuilder 메서드
  };
  return mockQueryBuilder;
}
```

## 참고사항

- TypeORM Repository의 모든 메서드를 Mock할 필요는 없음 (실제 사용되는 메서드만)
- QueryBuilder의 체이닝 패턴을 지원하도록 Mock 구현
- 테스트 간 데이터 격리 유지 (각 테스트 전 Mock 초기화)
- 다른 서비스(Inventory, Sales 등)에서도 동일한 패턴 사용 예정

## 관련 작업

- `tasks/backend/attendance-service-mvp.md` - 근태 서비스 MVP 구현 (데이터베이스 연동 완료)
- 향후 다른 서비스의 데이터베이스 연동 시에도 동일한 Mock 패턴 적용
