---
title: "[Ops] 인프라 MVP 설정"
owner: ops-team
status: in-progress
priority: high
due: 2025-11-05
related_prompts:
  - ../prompts/release-pipeline-design.md
---

## 목적

SPEC.md의 M0 MVP 스코프에 따라 기본 인프라 환경을 구축합니다. CI/CD 파이프라인, Docker 컨테이너화, 로컬 개발 환경 설정을 완료합니다.

## 완료 기준

### 1. 기본 CI/CD 파이프라인 (GitHub Actions)

- [x] GitHub Actions 워크플로 파일 생성
  - [x] 빌드 워크플로 (.github/workflows/ci.yml)
  - [x] 테스트 워크플로 (.github/workflows/ci.yml)
  - [x] Docker 이미지 빌드 워크플로 (.github/workflows/ci.yml, docker-push.yml)
- [x] 자동화된 테스트 실행
  - [x] 단위 테스트 (워크플로에 포함, 테스트 코드는 서비스별로 구현 필요)
  - [x] 통합 테스트 (Docker Compose 기반 통합 테스트 포함)
  - [ ] E2E 테스트 (Cypress) - 향후 구현 예정
- [x] Docker 이미지 빌드 및 레지스트리 푸시 (.github/workflows/docker-push.yml)
- [ ] 배포 자동화 (개발 환경) - M1에서 Argo CD로 구현 예정
- [ ] 빌드/배포 상태 알림 설정 - 향후 구현 예정

### 2. Docker 컨테이너화

- [x] 각 서비스별 Dockerfile 작성
  - [x] Attendance 서비스
  - [x] Inventory 서비스
  - [x] Sales 서비스
  - [ ] Notification 서비스 - 서비스 미구현
  - [ ] Auth 서비스 - 서비스 미구현
  - [x] Gateway 서비스
  - [x] Frontend
- [x] Docker Compose 파일 작성
  - [x] 서비스 정의
  - [x] 네트워크 설정
  - [x] 볼륨 설정
- [x] 멀티 스테이지 빌드 최적화
- [x] 이미지 크기 최적화

### 3. 로컬 개발 환경 설정

- [x] Docker Compose 기반 로컬 개발 환경 구성
- [x] 데이터베이스 컨테이너 설정 (PostgreSQL)
- [x] Redis 컨테이너 설정
- [x] 환경 변수 관리 (.env 파일, 예제 템플릿 - env.example)
- [x] 개발 환경 문서 작성
  - [x] 설정 가이드 (docs/ops/development-setup.md)
  - [x] 실행 방법 (docs/ops/development-setup.md)
  - [x] 문제 해결 가이드 (docs/ops/development-setup.md)
- [x] 개발자 온보딩 스크립트 작성 (scripts/setup.sh)

### 4. 기본 모니터링 설정

- [ ] 로깅 설정 (구조화된 로그) - 향후 구현 예정
- [x] 기본 헬스 체크 엔드포인트 구현
  - [x] Gateway 서비스 (/health, /healthz)
  - [x] Attendance 서비스 (/health)
  - [x] Inventory 서비스 (/health)
  - [x] Sales 서비스 (/health)
  - [x] Frontend (/health)
- [ ] 모니터링 대시보드 기본 구조 (향후 확장) - M1에서 구현 예정

## 산출물

- [x] GitHub Actions 워크플로 파일
  - [x] `.github/workflows/ci.yml` - CI 파이프라인
  - [x] `.github/workflows/docker-push.yml` - Docker 이미지 빌드 및 푸시
- [x] Dockerfile 및 Docker Compose 파일
  - [x] `backend/attendance-service/Dockerfile`
  - [x] `backend/inventory-service/Dockerfile`
  - [x] `backend/sales-service/Dockerfile`
  - [x] `backend/gateway-service/Dockerfile`
  - [x] `frontend/Dockerfile`
  - [x] `docker-compose.yml` (PostgreSQL, Redis 포함)
- [x] 환경 변수 템플릿 파일 (`env.example`)
- [x] 개발 환경 설정 문서 (`docs/ops/development-setup.md`)
- [x] CI/CD 파이프라인 문서 (`docs/ops/cicd-pipeline.md`)
- [x] 개발자 온보딩 스크립트 (`scripts/setup.sh`)

## 검증

- [ ] CI/CD 파이프라인 테스트 (빌드, 테스트, 배포) - GitHub Actions에서 실행 필요
- [ ] Docker 컨테이너 빌드 및 실행 테스트 - 로컬에서 테스트 필요
- [ ] 로컬 개발 환경 구동 테스트 - 로컬에서 테스트 필요
- [x] 문서 리뷰 및 검증
- [ ] 코드 리뷰 완료

## 참고사항

- Argo CD 연동은 M1에서 구현 예정
- Kubernetes 배포는 M1에서 구현 예정
- 고급 모니터링 (Prometheus/Grafana)는 M1에서 구현 예정
- OpenTelemetry 트레이싱은 M1에서 구현 예정
