# 반복 실행 Agent Command

SPEC.md의 최우선 High Priority 작업을 동적으로 찾아 반복 실행하여 완료합니다.
백엔드, 프론트엔드, Ops, Analytics, Spec, Tests 등 모든 카테고리의 작업을 지원합니다.

## 빠른 시작

**이 명령을 실행하면**:
1. SPEC.md를 읽어 High Priority 작업 목록 확인
2. `tasks/` 디렉터리의 모든 하위 카테고리에서 작업 파일들의 상태 확인
3. `todo` 또는 `in-progress` 상태인 High Priority 작업 중 하나 선택
4. 선택한 작업의 미완료 항목 식별 및 구현
5. 완료될 때까지 반복 실행

## 지원 카테고리

다음 카테고리들의 작업을 자동으로 검색하고 처리합니다:

- **backend**: `tasks/backend/` - 백엔드 서비스 구현
- **frontend**: `tasks/frontend/` - 프론트엔드 UI 구현
- **ops**: `tasks/ops/` - DevOps, CI/CD, 인프라
- **analytics**: `tasks/analytics/` - 분석 및 KPI
- **spec**: `tasks/spec/` - 스펙 및 설계
- **tests**: `tasks/tests/` - 테스트 관련

## 카테고리별 Phase 매핑

SPEC.md의 Phase와 카테고리 매핑:

- **v0.0.x (CONFIG)**: spec, analytics
- **v0.1.x (PROJECT)**: backend (Federation 스키마)
- **v0.2.x (TESTS)**: tests
- **v0.3.x (DATA)**: backend (데이터 모델)
- **v0.4.x (CODE)**: backend (비즈니스 로직)
- **v0.5.x (DEVOPS)**: ops
- **v0.6.x (PUBLIC)**: frontend

## 동적 작업 선택 프로세스

### Step 0: 최우선 작업 찾기 (각 실행 시작 시)

**이 단계는 매 실행마다 수행되어 현재 SPEC.md 상태에 맞는 최우선 작업을 선택합니다.**

1. **SPEC.md에서 High Priority 작업 목록 확인**
   ```
   - SPEC.md 파일 읽기
   - "우선순위" 섹션에서 High Priority 항목 확인
   - v0.1.x: Federation 스키마 및 통합
   - v0.4.x: 백엔드 서비스 MVP 구현
   - v0.5.x: CI/CD 파이프라인 안정화
   - v0.6.x: 프론트엔드 백엔드 연동
   - Phase별 카테고리 매핑 확인
   ```

2. **모든 카테고리에서 작업 파일 검색**
   ```
   검색할 디렉터리:
   - tasks/backend/*.md
   - tasks/frontend/*.md
   - tasks/ops/*.md
   - tasks/analytics/*.md
   - tasks/spec/*.md
   - tasks/tests/*.md
   
   각 파일의 YAML front matter 파싱:
   * title: 작업 제목
   * status: todo | in-progress | completed
   * priority: high | medium | low
   * owner: 작업 소유자
   ```

3. **작업 필터링 및 우선순위 정렬**
   ```
   필터 조건:
   - status가 "todo" 또는 "in-progress"인 작업만 선택
   - completed 상태 작업 제외
   
   정렬 순서 (우선순위 높은 순):
   1. priority: high + status: todo (아직 시작하지 않은 High Priority)
   2. priority: high + status: in-progress (진행 중인 High Priority)
   3. priority: medium + status: todo (중간 우선순위)
   4. priority: medium + status: in-progress
   
   동일한 우선순위인 경우:
   - SPEC.md의 "진행 중/예정 작업" 섹션에 나열된 순서 따름
   - Phase 순서 (v0.1.x → v0.4.x → v0.5.x → v0.6.x)
   - 또는 파일명 알파벳 순서
   ```

4. **최우선 작업 선택 및 정보 추출**
   ```
   선택된 작업 정보:
   - 작업 파일: tasks/{category}/{selected-task-name}.md
   - 카테고리: backend | frontend | ops | analytics | spec | tests
   - 작업 제목: front matter의 title 필드
   - 현재 상태: status 필드
   - 우선순위: priority 필드
   - 목적: "목적" 섹션의 내용
   - 완료 기준: "완료 기준" 섹션의 체크리스트
   ```

5. **작업 컨텍스트 로드**
   ```
   - 선택한 작업 파일 전체 내용 읽기
   - 완료된 항목([x])과 미완료 항목([ ]) 파악
   - 카테고리별 Phase 진행 상황 확인
   - 관련 참고 파일 확인 (related_prompts, related_tasks 등)
   - 카테고리별 구현 패턴 확인
   ```

### Step 1: 선택한 작업 파일 상태 확인

1. 선택한 작업 파일 읽기
   ```
   - tasks/{category}/{selected-task}.md 파일 읽기
   - front matter에서 status, priority, title, owner 확인
   - 카테고리 정보 확인
   ```

2. 상태 업데이트 (필요 시)
   ```
   - status가 "todo"이면 "in-progress"로 변경
   - 변경사항 저장
   ```

3. 완료/미완료 항목 파악
   ```
   - 완료된 항목([x])과 미완료 항목([ ]) 확인
   - 각 Phase별 완료율 계산
   - 카테고리별 체크리스트 구조 확인
   ```

### Step 2: 다음 작업 식별

1. 미완료 항목 중 우선순위 선택
   ```
   카테고리별 Phase 우선순위:
   
   Backend:
   1. Phase 1: GraphQL Schema 정의
   2. Phase 2: 데이터 모델/엔티티 구현
   3. Phase 3: Resolver 구현
   4. Phase 4: Service 로직 구현
   5. Phase 5: 테스트 작성
   
   Frontend:
   1. Phase 1: UI 컴포넌트 설계
   2. Phase 2: GraphQL 쿼리/뮤테이션 정의
   3. Phase 3: 페이지/화면 구현
   4. Phase 4: 상태 관리 및 데이터 바인딩
   5. Phase 5: 테스트 및 검증
   
   Ops:
   1. Phase 1: 인프라 설정
   2. Phase 2: CI/CD 파이프라인 구성
   3. Phase 3: 모니터링 및 로깅
   4. Phase 4: 보안 및 배포
   5. Phase 5: 문서화 및 검증
   
   Analytics/Spec/Tests:
   - 각 작업의 "완료 기준" 섹션 순서 따름
   ```

2. 의존성 확인
   ```
   - 선행 Phase가 완료되었는지 확인
   - 필요한 파일/디렉터리가 존재하는지 확인
   - 다른 카테고리의 작업과의 의존성 확인
   ```

3. 작업 범위 결정
   ```
   - 선택한 Phase 내에서 미완료 항목 식별
   - 한 번에 처리할 수 있는 항목 범위 결정
   - 카테고리별 구현 패턴 참고
   ```

### Step 3: 구현 실행

1. 선택한 항목 구현
   ```
   - 카테고리별 디렉터리 구조 확인
   - 관련 파일 생성/수정
   - 코드 구현
   - 같은 카테고리의 다른 작업 파일 참고
   ```

2. 코드 검증
   ```
   - 린트 에러 확인 및 수정
   - 타입 체크
   - 문법 오류 확인
   - 카테고리별 빌드/테스트 실행
   ```

3. 에러 수정
   ```
   - 발생한 에러 해결
   - 테스트 실행 (가능한 경우)
   - 관련 문서 확인
   ```

### Step 4: 진행 상태 업데이트

1. 체크리스트 업데이트
   ```
   - 완료한 항목 체크박스 업데이트 ([ ] → [x])
   - 작업 파일에 변경사항 저장
   ```

2. 구현 내용 요약 (필요 시)
   ```
   - 주요 구현 내용 문서화
   - 다음 단계 계획 작성
   - 카테고리별 특이사항 기록
   ```

### Step 5: 완료 확인 및 다음 실행 준비

1. 완료 조건 확인
   ```
   - 모든 체크리스트 항목이 완료되었는지 확인
   - 완료되지 않은 항목이 있으면 다음 실행을 위해 상태 저장
   ```

2. 작업 완료 처리
   ```
   모든 항목 완료 시:
   - status를 "completed"로 변경
   - 완료 일자 추가
   - 구현 내용 요약 작성
   - SPEC.md의 해당 섹션 업데이트
   - 카테고리별 문서 업데이트
   ```

3. 다음 실행 준비
   ```
   - 미완료 항목이 있으면 현재 상태 저장
   - 다음 실행 시 Step 0부터 다시 시작하여 새로운 최우선 작업 선택
   - 다른 카테고리의 작업도 자동으로 고려됨
   ```

## 카테고리별 작업 파일 구조

### Backend 작업 파일
```markdown
---
title: "[Backend] {서비스명} 서비스 MVP 기능 구현"
owner: backend-team
status: todo | in-progress | completed
priority: high | medium | low
---

## 목적
...

## 완료 기준
### 1. GraphQL Schema 정의
- [ ] Schema 파일 생성
- [ ] 타입 정의
...

### 2. 데이터 모델 구현
- [ ] 엔티티 파일 생성
- [ ] TypeORM 설정
...
```

### Frontend 작업 파일
```markdown
---
title: "[Frontend] {기능명} MVP 구현"
owner: frontend-team
status: todo | in-progress | completed
priority: high | medium | low
---

## 목적
...

## 완료 기준
### 1. UI 컴포넌트 설계
- [ ] 컴포넌트 구조 설계
- [ ] MUI 컴포넌트 선택
...

### 2. GraphQL 쿼리/뮤테이션 정의
- [ ] 쿼리 정의
- [ ] 뮤테이션 정의
...
```

### Ops 작업 파일
```markdown
---
title: "[Ops] {기능명}"
owner: devops-agent
status: todo | in-progress | completed
priority: high | medium | low
---

## 목적
...

## 완료 기준
### 1. 인프라 설정
- [ ] 설정 파일 생성
- [ ] 환경 변수 설정
...

### 2. CI/CD 파이프라인 구성
- [ ] GitHub Actions 워크플로 작성
- [ ] Docker 빌드 설정
...
```

## 동적 작업 선택 구현 예시

### 실제 구현 단계

1. **SPEC.md 읽기**
   ```
   read_file("SPEC.md")
   - "우선순위" 섹션 찾기 (line 869-886)
   - High Priority 항목 목록 확인
   - Phase별 카테고리 매핑 확인
   ```

2. **모든 카테고리 디렉터리 검색**
   ```
   카테고리별 검색:
   - glob_file_search("tasks/backend/*.md")
   - glob_file_search("tasks/frontend/*.md")
   - glob_file_search("tasks/ops/*.md")
   - glob_file_search("tasks/analytics/*.md")
   - glob_file_search("tasks/spec/*.md")
   - glob_file_search("tasks/tests/*.md")
   ```

3. **각 작업 파일의 front matter 파싱**
   ```
   각 파일에 대해:
   read_file("tasks/{category}/{filename}.md")
   - YAML front matter 추출 (---로 감싸진 부분)
   - status, priority, title, owner 필드 확인
   - 카테고리 정보 저장
   ```

4. **작업 필터링 및 정렬**
   ```
   필터링:
   - status in ["todo", "in-progress"]만 선택
   - priority == "high" 우선
   
   정렬:
   - (priority == "high", status == "todo") 우선
   - (priority == "high", status == "in-progress") 다음
   - (priority == "medium", status == "todo") 그 다음
   - Phase 순서 고려 (v0.1.x → v0.4.x → v0.5.x → v0.6.x)
   ```

5. **최우선 작업 선택**
   ```
   정렬된 목록의 첫 번째 작업 선택
   - 해당 작업 파일 경로 저장
   - 카테고리 정보 저장
   - 작업 정보 (title, status, priority, owner) 저장
   ```

### 현재 SPEC.md 기준 예상 선택 순서

현재 상태 (2025-01-27 기준) - High Priority 작업:

**Backend 카테고리:**
1. **sales-service-mvp.md** - status: todo, priority: high (최우선)
2. **gateway-service-mvp.md** - status: todo, priority: high
3. **attendance-service-mvp.md** - status: in-progress, priority: high
4. **inventory-service-mvp.md** - status: in-progress, priority: high

**Frontend 카테고리:**
1. **admin-dashboard-mvp.md** - status: todo, priority: high
2. **backend-integration-mvp.md** - status: in-progress, priority: high

**Ops 카테고리:**
- 대부분 medium priority 또는 completed 상태

따라서 첫 실행 시 **sales-service-mvp.md** (backend)가 선택됩니다.
완료 후 다음은 **gateway-service-mvp.md** 또는 **admin-dashboard-mvp.md**가 선택됩니다.

## 카테고리별 Phase별 일반적인 구현 단계

### Backend: Phase 1 - GraphQL Schema 정의
- [ ] `schemas/{service}.graphql` 파일 확인/생성
- [ ] 타입 정의 (Entity, Input, Output)
- [ ] Query 타입 정의
- [ ] Mutation 타입 정의
- [ ] Federation 디렉티브 추가 (@key 등)

### Backend: Phase 2 - 데이터 모델 구현
- [ ] `backend/{service}-service/src/entities/` 디렉터리에 엔티티 파일 생성
- [ ] TypeORM 엔티티 데코레이터 설정
- [ ] 관계 정의 (필요 시)
- [ ] 필드 검증 추가 (class-validator)

### Backend: Phase 3 - Resolver 구현
- [ ] `backend/{service}-service/src/resolvers/` 디렉터리에 Resolver 파일 생성
- [ ] Query Resolver 구현
- [ ] Mutation Resolver 구현
- [ ] DataLoader 패턴 적용 (필요 시)

### Backend: Phase 4 - Service 로직 구현
- [ ] `backend/{service}-service/src/services/` 디렉터리에 Service 파일 생성
- [ ] 비즈니스 로직 구현
- [ ] 데이터 검증 및 에러 처리
- [ ] 데이터베이스 연동

### Frontend: Phase 1 - UI 컴포넌트 설계
- [ ] 컴포넌트 구조 설계
- [ ] MUI 컴포넌트 선택 및 레이아웃 구성
- [ ] 와이어프레임 또는 디자인 확인

### Frontend: Phase 2 - GraphQL 쿼리/뮤테이션 정의
- [ ] `frontend/src/shared/api/graphql/` 디렉터리에 쿼리 파일 생성
- [ ] GraphQL 쿼리 정의
- [ ] GraphQL 뮤테이션 정의
- [ ] Code Generator 실행

### Frontend: Phase 3 - 페이지/화면 구현
- [ ] `frontend/src/pages/` 또는 `frontend/src/features/` 디렉터리에 페이지 생성
- [ ] 컴포넌트 구현
- [ ] 라우팅 설정

### Frontend: Phase 4 - 상태 관리 및 데이터 바인딩
- [ ] Apollo Client 쿼리/뮤테이션 훅 사용
- [ ] 상태 관리 (Redux Toolkit Query 또는 React Query)
- [ ] 에러 처리 및 로딩 상태

### Ops: Phase 1 - 인프라 설정
- [ ] Docker Compose 파일 설정
- [ ] 환경 변수 설정
- [ ] 네트워크 설정

### Ops: Phase 2 - CI/CD 파이프라인 구성
- [ ] GitHub Actions 워크플로 작성
- [ ] Docker 이미지 빌드 설정
- [ ] 테스트 실행 단계 추가

### Ops: Phase 3 - 모니터링 및 로깅
- [ ] 로깅 설정
- [ ] 모니터링 도구 설정
- [ ] 알림 설정

## 참고 사항

- 작업 파일의 front matter는 YAML 형식을 따릅니다
- status 필드: `todo`, `in-progress`, `completed`
- priority 필드: `high`, `medium`, `low`
- owner 필드: 작업 소유자 (backend-team, frontend-team, devops-agent 등)
- 각 작업은 독립적으로 실행 가능해야 합니다
- 완료된 작업은 자동으로 제외됩니다 (status: completed)
- 동일한 우선순위인 경우, SPEC.md의 순서를 따르거나 Phase 순서를 고려합니다
- 카테고리별로 다른 구현 패턴을 사용할 수 있습니다 (예: Backend는 NestJS, Frontend는 React)

## 진행 상황 추적

각 실행 후 다음 정보를 기록:
- 선택한 작업: `tasks/{category}/{task-file}.md`
- 카테고리: backend | frontend | ops | analytics | spec | tests
- 완료된 Phase: Phase {N}
- 완료된 항목 수 / 전체 항목 수
- 다음 실행 시 작업할 항목
- 발생한 이슈나 블로커

## 완료 시 작업

선택한 작업이 완료되면:
- [ ] 작업 파일의 status를 `completed`로 변경
- [ ] 완료 일자 추가
- [ ] 구현 내용 요약 작성
- [ ] SPEC.md의 해당 섹션 업데이트
- [ ] 카테고리별 문서 업데이트:
  - Backend: `docs/backend/README.md`
  - Frontend: `docs/frontend/README.md`
  - Ops: `docs/ops/README.md`
- [ ] 다음 실행 시 새로운 최우선 작업 자동 선택 (다른 카테고리 포함)
