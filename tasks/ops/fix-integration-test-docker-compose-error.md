---
title: "[Ops] Integration Test 단계 docker-compose 명령어 오류 수정"
owner: devops-agent
status: pending
priority: high
due: 2025-11-05
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

### 현재 코드

```138:156:.github/workflows/ci.yml
      - name: Build all services
        run: |
          docker-compose build

      - name: Start services
        run: |
          docker-compose up -d
          sleep 30

      - name: Health check
        run: |
          curl -f http://localhost:4000/health || exit 1
          curl -f http://localhost:4001/health || exit 1
          curl -f http://localhost:4002/health || exit 1
          curl -f http://localhost:4003/health || exit 1

      - name: Stop services
        if: always()
        run: docker-compose down
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

### [ ] 1. CI 워크플로우 수정 (.github/workflows/ci.yml)

- [ ] "Build all services" 단계의 `docker-compose build` → `docker compose build`로 변경
- [ ] "Start services" 단계의 `docker-compose up -d` → `docker compose up -d`로 변경
- [ ] "Stop services" 단계의 `docker-compose down` → `docker compose down`으로 변경

### [ ] 2. 테스트 및 검증

- [ ] 수정된 워크플로우 커밋 및 푸시
- [ ] GitHub Actions에서 Integration Test 작업 실행 확인
- [ ] 모든 서비스가 정상적으로 빌드되고 시작되는지 확인
- [ ] 헬스 체크가 성공하는지 확인
- [ ] 서비스 정리(cleanup)가 정상적으로 작동하는지 확인

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
