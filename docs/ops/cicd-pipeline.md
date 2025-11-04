# CI/CD 파이프라인 문서

이 문서는 Store Management 프로젝트의 CI/CD 파이프라인에 대해 설명합니다.

## 개요

이 프로젝트는 GitHub Actions를 사용하여 CI/CD 파이프라인을 구성합니다.

## 워크플로

### 1. CI Pipeline (`.github/workflows/ci.yml`)

모든 PR과 main/develop 브랜치에 대한 push 시 실행됩니다.

#### 작업 단계

1. **Backend Build & Test**
   - 각 백엔드 서비스(attendance, inventory, sales, gateway)를 빌드
   - 테스트 실행 (구현된 경우)
   - 빌드 성공 여부 확인

2. **Frontend Build & Test**
   - TypeScript 타입 체크
   - ESLint 린트 검사
   - 프로덕션 빌드
   - 테스트 실행 (구현된 경우)

3. **Docker Build**
   - 모든 서비스의 Docker 이미지 빌드
   - 빌드 캐시 활용

4. **Integration Test**
   - Docker Compose로 모든 서비스 시작
   - 헬스 체크 엔드포인트 확인
   - 서비스 간 통합 테스트

### 2. Docker Build & Push (`.github/workflows/docker-push.yml`)

main 브랜치에 push되거나 태그가 생성될 때 실행됩니다.

#### 작업 단계

1. **Build and Push Docker Images**
   - 각 서비스의 Docker 이미지 빌드
   - GitHub Container Registry (ghcr.io)에 푸시
   - 태그 전략:
     - 브랜치 이름
     - PR 번호
     - Semantic version 태그
     - SHA 커밋 해시
     - latest (기본 브랜치만)

## 빌드 캐시

Docker 빌드 캐시는 GitHub Actions 캐시를 활용하여 빌드 시간을 단축합니다.

## 환경 변수 및 시크릿

필요한 시크릿:
- `GITHUB_TOKEN`: 자동으로 제공됨 (패키지 푸시 권한)

## 배포

현재는 Docker 이미지 빌드 및 푸시만 수행합니다. 실제 배포는 M1에서 Argo CD를 통해 자동화될 예정입니다.

## 로컬에서 워크플로 테스트

GitHub Actions 워크플로를 로컬에서 테스트하려면 [act](https://github.com/nektos/act)를 사용할 수 있습니다:

```bash
# 설치
brew install act

# 워크플로 실행
act push
```

## 트러블슈팅

### 빌드 실패

1. 로그 확인: GitHub Actions 실행 로그 확인
2. 로컬 테스트: `docker-compose build`로 로컬에서 빌드 테스트
3. 캐시 문제: `docker-compose build --no-cache`로 캐시 없이 빌드

### 통합 테스트 실패

1. 서비스 시작 확인: `docker-compose ps`
2. 헬스 체크 확인: 직접 curl로 확인
3. 로그 확인: `docker-compose logs`

### Docker 이미지 푸시 실패

1. 권한 확인: GitHub 토큰 권한 확인
2. 레지스트리 확인: ghcr.io 접근 가능 여부 확인

## 향후 계획 (M1)

- Argo CD 연동
- Kubernetes 배포 자동화
- 스테이징 환경 배포
- 프로덕션 배포 승인 프로세스
- 롤백 자동화

