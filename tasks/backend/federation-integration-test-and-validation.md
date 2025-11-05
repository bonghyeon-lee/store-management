---
title: "[Backend] Federation 통합 검증 및 서비스 간 데이터 조인 구현"
owner: backend-team
status: todo
priority: high
due: 2025-11-15
related_tasks:
  - ./federation-schema.md
  - ./generate-backend-subgraphs-from-federation.md
  - ./federation-integration-mvp.md
related_prompts:
  - ../prompts/graphql-contract-review.md
---

## 목적

SPEC.md의 High Priority 항목에 따라, Gateway를 통한 Federation 통합이 실제로 작동하는지 검증하고, 서비스 간 데이터 조인을 구현합니다. 현재 Gateway는 구현되어 있으나, 실제 Subgraph 서비스들과의 통합 검증 및 DataLoader 패턴을 통한 N+1 문제 해결이 필요합니다.

## 배경

- Gateway 서비스는 이미 구현되어 있음 (`backend/gateway-service`)
- 각 Subgraph 서비스들은 기본 구조가 구현되어 있음
- 그러나 실제 Federation 통합 검증 및 서비스 간 데이터 조인 로직이 미완성
- N+1 문제 해결을 위한 DataLoader 패턴 구현 필요

## 완료 기준

### 1. Federation 스키마 통합 검증

- [ ] Gateway에서 모든 Subgraph 서비스 연결 확인
  - Attendance 서비스 (4001)
  - Inventory 서비스 (4002)
  - Sales 서비스 (4003)
  - Notification 서비스 (4004)
  - Auth 서비스 (4005)
- [ ] Federation 스키마 컴파일 성공 확인
- [ ] Apollo Studio에서 스키마 검증 및 시각화
- [ ] 스키마 충돌 검사 및 해결
  - 중복된 타입 정의 확인
  - Federation 디렉티브(@key, @extends, @requires) 검증
  - 타입 확장 및 관계 정의 확인

### 2. 서비스 간 데이터 조인 구현

- [ ] DataLoader 패턴 구현
  - 각 Subgraph 서비스에 DataLoader 설정
  - 배치 로딩 로직 구현
  - 캐싱 전략 적용 (기본 구조)
- [ ] 교차 서비스 쿼리 구현
  - 예: Employee의 Store 정보 조회
  - 예: Order의 Employee 정보 조회
  - 예: InventoryItem의 Product 정보 조회
- [ ] N+1 문제 해결 검증
  - 성능 테스트 수행
  - 쿼리 실행 계획 분석
  - 배치 로딩 확인

### 3. 통합 테스트 작성

- [ ] Federation 통합 E2E 테스트 작성
  - Gateway를 통한 통합 쿼리 테스트
  - 서비스 간 데이터 조인 테스트
  - 에러 처리 테스트
- [ ] Contract 테스트 작성
  - GraphQL 스키마 호환성 검증
  - Breaking Change 감지 테스트
- [ ] 성능 테스트
  - N+1 문제 해결 전/후 비교
  - 응답 시간 측정
  - 동시 요청 처리 테스트

### 4. 문서화

- [ ] Federation 통합 상태 문서 작성
  - 각 서비스 Subgraph 상태 정리
  - 서비스 간 의존성 다이어그램
  - 데이터 조인 패턴 문서화
- [ ] DataLoader 패턴 가이드 작성
  - 구현 방법
  - 사용 예제
  - 베스트 프랙티스
- [ ] 문제 해결 가이드 작성
  - 스키마 충돌 해결 방법
  - N+1 문제 디버깅 방법
  - 성능 최적화 팁

## 산출물

- Federation 통합 검증 리포트
- DataLoader 구현 코드
- 통합 테스트 코드
- 문서화 파일 (`docs/backend/federation-integration.md`)
- 성능 테스트 결과 리포트

## 검증

- [ ] Gateway에서 통합 스키마 조회 성공
- [ ] Apollo Studio에서 스키마 시각화 확인
- [ ] 교차 서비스 쿼리 실행 성공
- [ ] N+1 문제 해결 확인 (배치 로딩 동작)
- [ ] 통합 테스트 모두 통과
- [ ] Contract 테스트 모두 통과
- [ ] 성능 테스트 결과 기준 충족 (p95 응답 시간 300ms 이하)
- [ ] 코드 리뷰 완료

## 참고사항

- Subscription은 M1에서 구현 예정
- 고급 캐싱 전략은 M1에서 구현 예정
- Schema Registry 도입은 M1에서 검토 예정
- GraphQL Inspector 통합은 M1에서 구현 예정
- 현재는 IntrospectAndCompose 방식 사용 (향후 Managed Federation으로 전환 가능)

## 기술적 세부사항

### Federation 키 전략 재검토

각 서비스의 Federation 키가 올바르게 정의되었는지 확인:

- **Employee** (Attendance): `@key(fields: "id")`
- **Attendance**: `@key(fields: "id")` 또는 복합 키 검토
- **Product** (Inventory): `@key(fields: "id")`
- **InventoryItem**: `@key(fields: "storeId sku")`
- **Order** (Sales): `@key(fields: "id")` 또는 `@key(fields: "storeId orderId")`
- **User** (Auth): `@key(fields: "id")`
- **Notification**: `@key(fields: "id")`

### DataLoader 구현 예시

```typescript
// 예: Employee의 Store 정보를 조회하는 DataLoader
class StoreDataLoader {
  private loader: DataLoader<string, Store>;

  constructor(storeService: StoreService) {
    this.loader = new DataLoader(async (storeIds: string[]) => {
      const stores = await storeService.findManyByIds(storeIds);
      return storeIds.map(id => stores.find(s => s.id === id));
    });
  }

  load(storeId: string): Promise<Store> {
    return this.loader.load(storeId);
  }
}
```

### 테스트 시나리오

1. **기본 통합 테스트**

   ```graphql
   query {
     employees {
       id
       name
       store {
         id
         name
       }
     }
   }
   ```

2. **N+1 문제 해결 검증**
   - 여러 Employee를 조회할 때 Store 정보가 배치로 로드되는지 확인
   - 네트워크 요청 횟수 측정

3. **에러 처리 테스트**
   - 일부 서비스가 다운되었을 때의 동작
   - 타임아웃 처리
   - 부분 실패 처리

## 다음 단계

이 작업 완료 후:

- 프론트엔드 GraphQL 클라이언트 연동 작업 진행
- 각 서비스 MVP 완성 작업 진행
- 실시간 기능(Subscription) 구현 검토
