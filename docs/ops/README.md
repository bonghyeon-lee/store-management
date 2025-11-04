# Operations Playbook

## 인프라 구성

- Kubernetes (EKS/GKE/AKS 중 선택)
- Terraform + Helm으로 IaC 관리
- 서비스 메시: Istio(기본) 또는 Linkerd
- GitOps: Argo CD, 환경별 ApplicationSet

## CI/CD 파이프라인

1. GitHub Actions에서 코드 푸시 → lint/test/build 실행
2. Docker 이미지 빌드 & 이미지 스캔(Trivy)
3. Helm 차트 패키징 → Argo CD Sync 요청
4. Canary 배포(Argo Rollouts) → SLO 기반 자동 롤백

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
