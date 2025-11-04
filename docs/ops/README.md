# Operations Playbook

## 인프라 구성

- Kubernetes (EKS/GKE/AKS 중 선택)
- Terraform + Helm으로 IaC 관리
- 서비스 메시: Istio(기본) 또는 Linkerd
- GitOps: Argo CD, 환경별 ApplicationSet

## CI/CD 파이프라인

### 개요

GitHub Actions 기반 CI/CD 파이프라인으로 코드 품질 검사, 보안 스캔, 자동 배포를 수행합니다.

워크플로 파일: `.github/workflows/main.yml`

### 파이프라인 단계

#### 1. Lint & Test

- **트리거**: `push` 또는 `pull_request` 이벤트
- **작업**:
  - Node.js 환경 설정 (v20)
  - 의존성 설치 (`npm ci`)
  - Linter 실행 (ESLint 등)
  - 단위 테스트 실행
- **실행 조건**: 모든 브랜치에서 실행

#### 2. Build & Security Scan

- **트리거**: `lint-and-test` 작업 성공 후
- **작업**:
  - Docker Buildx를 사용한 멀티 플랫폼 빌드
  - 서비스별 Docker 이미지 빌드 (gateway, attendance, inventory, sales, notification, auth)
  - GitHub Container Registry (GHCR)에 이미지 푸시
  - Trivy를 사용한 보안 취약점 스캔
    - CRITICAL, HIGH 심각도 취약점 검사
    - SARIF 형식으로 GitHub Security에 결과 업로드
- **매트릭스 전략**: 서비스별 병렬 빌드

#### 3. Package Helm Charts

- **트리거**: `main` 브랜치에 `push` 이벤트
- **작업**:
  - Helm 차트 패키징
  - 아티팩트로 저장 (배포용)
- **실행 조건**: `main` 브랜치에만 실행

#### 4. Argo CD Sync

- **트리거**: `main` 브랜치에 `push` 이벤트
- **작업**:
  - Argo CD CLI 설치
  - Argo CD Application 동기화 트리거
  - 자동 배포 실행
- **필수 시크릿**:
  - `ARGOCD_SERVER`: Argo CD 서버 URL
  - `ARGOCD_AUTH_TOKEN`: Argo CD 인증 토큰
- **실행 조건**: 시크릿이 설정된 경우에만 실행

### 보안 스캔

- **도구**: Trivy
- **스캔 범위**: 모든 서비스 Docker 이미지
- **심각도**: CRITICAL, HIGH
- **결과 저장**: GitHub Security 탭에 SARIF 형식으로 업로드
- **예외 관리**: Release Checklist에서 검토 및 승인 필요

### Argo CD 통합

- **Application 매니페스트**: `infra/argo/application.yaml`
- **ApplicationSet**: `infra/argo/applicationset.yaml` (다중 환경 관리)
- **설정 방법**: `infra/argo/README.md` 참고

### 환경 변수 및 시크릿

#### GitHub Secrets (필수)

- `ARGOCD_SERVER`: Argo CD 서버 URL
- `ARGOCD_AUTH_TOKEN`: Argo CD 인증 토큰

#### 환경 변수

- `REGISTRY`: `ghcr.io` (기본값)
- `IMAGE_PREFIX`: `store-management`

### 배포 프로세스

1. 코드 푸시 → GitHub Actions 트리거
2. Lint & Test 단계 통과
3. Docker 이미지 빌드 및 Trivy 스캔
4. Helm 차트 패키징
5. Argo CD Sync 요청
6. Kubernetes 클러스터에 배포
7. Canary 배포(Argo Rollouts) → SLO 기반 자동 롤백

### Release Checklist 연동

배포 전 다음 항목을 확인하세요:

- [ ] CI 파이프라인 통과 확인
- [ ] Trivy 보안 스캔 결과 검토
- [ ] Argo CD Sync 준비 상태 확인

자세한 내용은 `../templates/release-checklist.md` 참고

## 관측성

- Metrics: Prometheus + Grafana 대시보드(`attendance`, `inventory`, `gateway`)
- Logs: Loki/Elastic Stack, 로그 레벨 표준화(JSON 구조)
- Tracing: OpenTelemetry Collector → Jaeger/Tempo
- 알람: Alertmanager → Slack, PagerDuty

## 보안 및 규정

- Secret 관리: HashiCorp Vault 또는 AWS Secrets Manager
- 네트워크 정책: Calico/OPA
- 컨테이너 스캔: Trivy, Grype
- 감사: Falco(Runtime Security), OPA Gatekeeper(Admission Control)

## 운영 프로세스

- 배포 전 체크리스트는 `../templates/release-checklist.md`
- 장애 발생 시 Runbook: `../runbooks/incident-response.md`
- 주간 리뷰: SLO, 에러 로그, 비용 리포트 작성

## 참고

- 요구사항: `../../SPEC.md`
- 워크플로: `../../workflows/README.md`
