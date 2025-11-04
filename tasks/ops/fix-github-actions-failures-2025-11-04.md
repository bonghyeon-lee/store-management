---
title: "[Ops] GitHub Actions 실패 원인 분석 및 수정 (2025-11-04)"
owner: devops-agent
status: in-progress
priority: high
due: 2025-11-05
related_tasks:
  - ./cicd-pipeline.md
  - ./fix-github-actions-failure-0f75c29.md
---

## 문제 분석

두 개의 GitHub Actions 워크플로우가 실패했습니다:

### 1. CI/CD Pipeline 실패 (main.yml)

**실행 ID**: [19073255011](https://github.com/bonghyeon-lee/store-management/actions/runs/19073255011/job/54481670154)

**문제점**:

1. **Dockerfile 경로 오류**
   - 현재: `./services/${{ matrix.service }}/Dockerfile`
   - 실제 경로: `./backend/${{ matrix.service }}-service/Dockerfile`
   - 문제: `services` 디렉토리가 존재하지 않음

2. **서비스 이름 불일치**
   - Matrix에서: `gateway`, `attendance`, `inventory`, `sales`, `notification`, `auth`
   - 실제 디렉토리: `gateway-service`, `attendance-service`, `inventory-service`, `sales-service`, `notification-service`, `auth-service`
   - Build context도 잘못된 경로를 참조

3. **Trivy SARIF 파일 업로드 실패**
   - `trivy-results.sarif` 파일이 존재하지 않는데 업로드 시도
   - 파일 생성 실패 시에도 업로드를 시도하는 문제

4. **CodeQL Action 권한 부족**
   - `security-events: write` 권한이 필요하지만 설정되지 않음
   - 에러: "Resource not accessible by integration"

5. **Image reference 오류**
   - Trivy 스캔 시 이미지 레퍼런스가 잘못됨
   - 빌드 후 이미지가 푸시되기 전에 스캔하려고 시도

### 2. CI Pipeline 실패 (ci.yml)

**실행 ID**: [19073255098](https://github.com/bonghyeon-lee/store-management/actions/runs/19073255098/job/54481625447)

**문제점**:

1. **Frontend Lint 실패**
   - Exit code 2로 실패
   - `npm run lint` 명령 실행 시 실제 lint 오류가 발생
   - `--max-warnings=0` 옵션으로 인해 경고도 실패로 처리됨

## 해결 방안

### 1. main.yml 수정

#### 1.1 Dockerfile 경로 및 서비스 이름 수정

```yaml
# 수정 전
matrix:
  service:
    - gateway
    - attendance
    # ...
file: ./services/${{ matrix.service }}/Dockerfile

# 수정 후
matrix:
  service:
    - gateway-service
    - attendance-service
    - inventory-service
    - sales-service
    - notification-service
    - auth-service
context: ./backend/${{ matrix.service }}
file: ./backend/${{ matrix.service }}/Dockerfile
```

#### 1.2 Trivy 스캔 및 업로드 로직 수정

- Trivy 스캔을 로컬 이미지에 대해 수행하거나, 이미지 빌드 후 바로 스캔
- SARIF 파일 생성 확인 후 조건부 업로드
- Image reference를 올바르게 설정

#### 1.3 CodeQL Action 권한 추가

```yaml
jobs:
  build-and-scan:
    permissions:
      contents: read
      packages: write
      security-events: write  # 추가 필요
```

### 2. ci.yml 수정

#### 2.1 Frontend Lint 오류 해결

- 실제 lint 오류 확인 및 수정
- 또는 `--max-warnings=0` 옵션을 제거하거나 증가
- 또는 lint 경고를 허용하도록 설정

## 작업 항목

### [ ] 1. main.yml 수정

- [ ] Dockerfile 경로 수정 (`./services/` → `./backend/`)
- [ ] 서비스 이름을 전체 이름으로 변경 (`gateway` → `gateway-service`)
- [ ] Build context 경로 수정
- [ ] Trivy 스캔 로직 수정 (로컬 이미지 스캔)
- [ ] SARIF 파일 업로드 조건 수정 (파일 존재 확인)
- [ ] CodeQL Action 권한 추가 (`security-events: write`)
- [ ] Image reference 수정

### [ ] 2. ci.yml 수정

- [ ] Frontend lint 오류 확인 및 수정
- [ ] Lint 설정 검토 (`--max-warnings=0` 옵션 처리)

### [ ] 3. 테스트 및 검증

- [ ] 수정된 워크플로우 커밋 및 푸시
- [ ] GitHub Actions에서 실행 확인
- [ ] 모든 단계가 성공적으로 완료되는지 확인

## 참고 사항

- 실제 서비스 디렉토리 구조: `backend/{service-name}/`
- Dockerfile 위치: `backend/{service-name}/Dockerfile`
- 존재하는 서비스: `gateway-service`, `attendance-service`, `inventory-service`, `sales-service`, `notification-service`, `auth-service`
- Trivy는 로컬 이미지나 이미 푸시된 이미지에 대해 스캔 가능
- CodeQL Action은 `security-events: write` 권한이 필요

## 예상 결과

수정 후 다음 워크플로우가 성공적으로 실행되어야 함:

- ✅ CI Pipeline (ci.yml)
- ✅ CI/CD Pipeline (main.yml)
- ✅ 모든 서비스 빌드 및 보안 스캔 성공
- ✅ Trivy 결과가 GitHub Security에 업로드됨

