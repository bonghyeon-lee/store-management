---
title: "[Ops] 인프라 MVP 설정"
owner: ops-team
status: todo
priority: high
due: 2025-11-05
related_prompts:
  - ../prompts/release-pipeline-design.md
---

## 목적

SPEC.md의 M0 MVP 스코프에 따라 기본 인프라 환경을 구축합니다. CI/CD 파이프라인, Docker 컨테이너화, 로컬 개발 환경 설정을 완료합니다.

## 완료 기준

### 1. 기본 CI/CD 파이프라인 (GitHub Actions)

- [ ] GitHub Actions 워크플로 파일 생성
  - 빌드 워크플로
  - 테스트 워크플로
  - Docker 이미지 빌드 워크플로
- [ ] 자동화된 테스트 실행
  - 단위 테스트
  - 통합 테스트
  - E2E 테스트 (Cypress)
- [ ] Docker 이미지 빌드 및 레지스트리 푸시
- [ ] 배포 자동화 (개발 환경)
- [ ] 빌드/배포 상태 알림 설정

### 2. Docker 컨테이너화

- [ ] 각 서비스별 Dockerfile 작성
  - Attendance 서비스
  - Inventory 서비스
  - Sales 서비스
  - Notification 서비스
  - Auth 서비스
  - Gateway 서비스
  - Frontend
- [ ] Docker Compose 파일 작성
  - 서비스 정의
  - 네트워크 설정
  - 볼륨 설정
- [ ] 멀티 스테이지 빌드 최적화
- [ ] 이미지 크기 최적화

### 3. 로컬 개발 환경 설정

- [ ] Docker Compose 기반 로컬 개발 환경 구성
- [ ] 데이터베이스 컨테이너 설정 (PostgreSQL)
- [ ] Redis 컨테이너 설정
- [ ] 환경 변수 관리 (.env 파일, 예제 템플릿)
- [ ] 개발 환경 문서 작성
  - 설정 가이드
  - 실행 방법
  - 문제 해결 가이드
- [ ] 개발자 온보딩 스크립트 작성

### 4. 기본 모니터링 설정

- [ ] 로깅 설정 (구조화된 로그)
- [ ] 기본 헬스 체크 엔드포인트 구현
- [ ] 모니터링 대시보드 기본 구조 (향후 확장)

## 산출물

- GitHub Actions 워크플로 파일
- Dockerfile 및 Docker Compose 파일
- 환경 변수 템플릿 파일
- 개발 환경 설정 문서
- CI/CD 파이프라인 문서

## 검증

- [ ] CI/CD 파이프라인 테스트 (빌드, 테스트, 배포)
- [ ] Docker 컨테이너 빌드 및 실행 테스트
- [ ] 로컬 개발 환경 구동 테스트
- [ ] 문서 리뷰 및 검증
- [ ] 코드 리뷰 완료

## 참고사항

- Argo CD 연동은 M1에서 구현 예정
- Kubernetes 배포는 M1에서 구현 예정
- 고급 모니터링 (Prometheus/Grafana)는 M1에서 구현 예정
- OpenTelemetry 트레이싱은 M1에서 구현 예정
