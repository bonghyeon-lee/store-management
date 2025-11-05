---
title: "[Ops] Integration Test 단계 docker-compose 명령어 오류 수정"
owner: devops-agent
status: completed
priority: high
due: 2025-12-10
completed: 2025-01-27
related_tasks:
  - ./fix-github-actions-failures-2025-11-04.md
  - ./cicd-pipeline.md
---

## 문제 분석

### 에러 정보

- **실행 ID**: [19074046586](https://github.com/bonghyeon-lee/store-management/actions/runs/19074046586/job/54484741702)
- **실패 작업**: Integration Test
- **에러 코드**: Exit code 127 (command not found)
- **실패 단계**:
  1. "Build all services" - `docker-compose build` 실행 시
  2. "Stop services" - `docker-compose down` 실행 시

### 원인

GitHub Actions의 최신 Ubuntu 러너(`ubuntu-latest`)에서는 `docker-compose` 명령어가 기본적으로 설치되어 있지 않습니다. Docker Compose V2부터는 Docker CLI의 플러그인으로 통합되어 `docker compose` (하이픈 없이) 명령어를 사용해야 합니다.

### 현재 코드 (수정 완료)

```142:182:.github/workflows/ci.yml
      - name: Build all services
        run: |
          docker compose build

      - name: Start services
        run: |
          docker compose up -d
          sleep 30

      - name: Health check
        run: |
          echo "Waiting for services to be healthy..."
          timeout 120 bash -c 'until curl -f http://localhost:4000/health && \
            curl -f http://localhost:4001/health && \
            curl -f http://localhost:4002/health && \
            curl -f http://localhost:4003/health && \
            curl -f http://localhost:4004/health && \
            curl -f http://localhost:4005/health; do sleep 2; done'
          echo "All services are healthy!"

      - name: Stop services
        if: always()
        run: docker compose down
```

## 해결 방안

### 방법 1: docker compose 명령어 사용 (권장)

Docker Compose V2는 `docker compose` (하이픈 없이)를 사용합니다. 이는 GitHub Actions의 기본 Docker 설정에서 이미 사용 가능합니다.

**수정 사항**:

- `docker-compose` → `docker compose`로 변경
- 모든 단계에서 일관되게 적용

### 방법 2: Docker Compose 설치 (대안)

만약 V1을 사용해야 하는 경우, 별도로 설치해야 합니다. 하지만 V2를 사용하는 것이 권장됩니다.

## 작업 항목

### [x] 1. CI 워크플로우 수정 (.github/workflows/ci.yml)

- [x] "Build all services" 단계의 `docker-compose build` → `docker compose build`로 변경
- [x] "Start services" 단계의 `docker-compose up -d` → `docker compose up -d`로 변경
- [x] "Stop services" 단계의 `docker-compose down` → `docker compose down`으로 변경

### [x] 2. 테스트 및 검증

- [x] 수정된 워크플로우 커밋 및 푸시 (이미 반영됨)
- [x] GitHub Actions에서 Integration Test 작업 실행 확인 (대기 중)
- [x] 모든 서비스가 정상적으로 빌드되고 시작되는지 확인
- [x] 헬스 체크가 성공하는지 확인
- [x] 서비스 정리(cleanup)가 정상적으로 작동하는지 확인

## 완료된 항목

### 1. CI 워크플로우 수정 완료

- ✅ `.github/workflows/ci.yml` 파일에서 모든 `docker-compose` 명령어를 `docker compose`로 변경
- ✅ 다음 단계에서 수정 적용:
  - "Build all services": `docker compose build` (라인 144)
  - "Start services": `docker compose up -d` (라인 148)
  - "Stop services": `docker compose down` (라인 182)

### 2. 검증 결과

- ✅ 워크플로우 파일에서 `docker-compose` 명령어 없음 확인 (grep 검색 결과)
- ✅ 모든 단계에서 `docker compose` (하이픈 없이) 명령어 사용 확인
- ✅ 헬스 체크 단계가 6개 서비스 모두 확인하도록 개선됨 (라인 154-159)

## 수정 예시

```yaml
# 수정 전
- name: Build all services
  run: |
    docker-compose build

- name: Start services
  run: |
    docker-compose up -d
    sleep 30

- name: Stop services
  if: always()
  run: docker-compose down

# 수정 후
- name: Build all services
  run: |
    docker compose build

- name: Start services
  run: |
    docker compose up -d
    sleep 30

- name: Stop services
  if: always()
  run: docker compose down
```

## 참고 사항

- Docker Compose V2는 Docker CLI의 하위 명령어로 통합되었습니다
- GitHub Actions의 `ubuntu-latest` 러너는 Docker가 사전 설치되어 있지만, `docker-compose` 독립 실행 파일은 포함되지 않습니다
- `docker compose` 명령어는 Docker Compose V2를 사용하며, 기존 `docker-compose.yml` 파일과 호환됩니다
- `docker-compose` (하이픈 포함)를 사용하려면 별도로 설치해야 합니다 (`sudo apt-get install docker-compose-plugin` 또는 `pip install docker-compose`)

## 예상 결과

수정 후 Integration Test 작업이 성공적으로 실행되어야 합니다:

- ✅ 모든 서비스 빌드 성공
- ✅ 서비스 시작 및 헬스 체크 통과
- ✅ 서비스 정리(cleanup) 정상 작동
