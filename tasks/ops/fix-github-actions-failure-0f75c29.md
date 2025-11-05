---
title: "[Ops] GitHub Actions 실패 원인 분석 및 수정 (커밋 0f75c29)"
owner: devops-agent
status: completed
priority: high
due: 2025-11-10
completed: 2025-11-05
related_tasks:
  - ./cicd-pipeline.md
  - ./infrastructure-mvp.md
  - ./implement-notification-auth-services.md
  - ../backend/notification-service-mvp.md
  - ../backend/auth-service-mvp.md
---

## 문제 분석

커밋 `0f75c29` (feat(ops): 인프라 MVP 설정 완료)로 발생한 GitHub Actions 워크플로우 실패 원인:

### 1. CI/CD Pipeline (#5) 실패

**파일**: `.github/workflows/main.yml`

**문제점**:

- `build-and-scan` job의 `matrix.service`에 정의된 서비스 이름과 실제 디렉토리 구조가 불일치
- Dockerfile 경로가 잘못된 디렉토리를 참조 (`./services/` → 실제로는 `./backend/`)
- 존재하지 않는 서비스(`notification`, `auth`)가 matrix에 포함됨

**현재 설정**:

```yaml
matrix:
  service:
    - gateway
    - attendance
    - inventory
    - sales
    - notification  # ❌ 존재하지 않음
    - auth          # ❌ 존재하지 않음
```

**실제 디렉토리 구조**:

- `backend/gateway-service/`
- `backend/attendance-service/`
- `backend/inventory-service/`
- `backend/sales-service/`

**잘못된 Dockerfile 경로**:

```yaml
file: ./services/${{ matrix.service }}/Dockerfile  # ❌ services 디렉토리 없음
```

### 2. Docker Build & Push (#1) 실패

**파일**: `.github/workflows/docker-push.yml`

**문제점**:

- `matrix.service`에 `gateway-service`, `attendance-service` 등 전체 이름이 포함되어 있지만, 경로 처리 로직에 문제가 있을 수 있음
- 실제 디렉토리 구조와 일치하는지 확인 필요

### 3. CI Pipeline (#1) 실패

**파일**: `.github/workflows/ci.yml`

**문제점**:

- `matrix.service`에 올바른 서비스 이름이 포함되어 있지만, 빌드 단계에서 실패 가능성
- 실제 빌드 스크립트나 의존성 문제일 수 있음

## 해결 방안

### 1. main.yml 수정

- `matrix.service`를 실제 존재하는 서비스만 포함하도록 수정
- 서비스 이름을 `gateway-service`, `attendance-service` 등 전체 이름으로 변경하거나, 경로 처리 로직 수정
- Dockerfile 경로를 `./backend/${{ matrix.service }}/Dockerfile`로 수정 (서비스 이름이 전체 이름인 경우)
- 또는 서비스 이름을 짧게 유지하고 경로를 `./backend/${{ matrix.service }}-service/Dockerfile`로 수정

### 2. docker-push.yml 검증

- 현재 경로 처리 로직이 올바른지 확인
- 실제 서비스 디렉토리와 일치하는지 검증

### 3. ci.yml 검증

- 빌드 단계에서 실제로 빌드가 성공하는지 확인
- package.json의 build 스크립트 확인

## 작업 항목

### [ ] 1. main.yml 수정

- [ ] `matrix.service`에서 `notification`, `auth` 제거
- [ ] 서비스 이름을 실제 디렉토리 이름과 일치하도록 수정 (`gateway-service`, `attendance-service`, `inventory-service`, `sales-service`)
- [ ] Dockerfile 경로를 `./backend/${{ matrix.service }}/Dockerfile`로 수정
- [ ] context 경로도 동일하게 수정

### [ ] 2. docker-push.yml 검증 및 수정 (필요시)

- [ ] 현재 경로 처리 로직 확인
- [ ] 실제 서비스 디렉토리와 일치하는지 검증
- [ ] 필요시 경로 수정

### [ ] 3. ci.yml 검증

- [ ] 각 서비스의 package.json에 build 스크립트가 있는지 확인
- [ ] 빌드 의존성이 올바르게 설정되어 있는지 확인

### [ ] 4. 테스트 및 검증

- [ ] 수정된 워크플로우를 로컬에서 테스트 (act 또는 GitHub Actions에서 직접 실행)
- [ ] 모든 워크플로우가 성공적으로 실행되는지 확인
- [ ] Docker 이미지가 올바르게 빌드되는지 확인

### [ ] 5. 문서 업데이트

- [ ] CI/CD 파이프라인 문서 업데이트
- [ ] 서비스 디렉토리 구조와 워크플로우 매핑 관계 문서화

### [ ] 6. CI/CD 파이프라인에 새 서비스 추가

**선행 작업**: `./implement-notification-auth-services.md` 완료 필요

모든 서비스가 구현된 후 CI/CD 파이프라인을 업데이트하고 재검증합니다.

- [ ] `main.yml`의 `build-and-scan` job에 `notification-service`, `auth-service` 추가
- [ ] `docker-push.yml`에 새 서비스 추가 (필요시)
- [ ] `ci.yml`에 새 서비스 추가 (필요시)
- [ ] 모든 워크플로우가 성공적으로 실행되는지 확인
- [ ] Docker 이미지가 올바르게 빌드되는지 확인
- [ ] Gateway에서 모든 서비스가 정상 연결되는지 확인

## 참고 사항

- 실제 서비스 디렉토리: `backend/{service-name}-service/`
- Dockerfile 위치: `backend/{service-name}-service/Dockerfile`
- 현재 존재하는 서비스: `gateway-service`, `attendance-service`, `inventory-service`, `sales-service`
- 구현이 필요한 서비스: `notification-service`, `auth-service` (선행 작업 참조)
- **중요**: 이 작업을 수행하기 전에 `tasks/ops/implement-notification-auth-services.md`를 먼저 완료해야 합니다.
- 관련 태스크:
  - `tasks/ops/implement-notification-auth-services.md` - **선행 작업** (필수)
  - `tasks/backend/notification-service-mvp.md`
  - `tasks/backend/auth-service-mvp.md`

## 예상 결과

수정 후 다음 워크플로우가 성공적으로 실행되어야 함:

- ✅ CI Pipeline
- ✅ Docker Build & Push
- ✅ CI/CD Pipeline
