# Argo CD Application Configuration

이 디렉토리는 Argo CD Application 매니페스트를 포함합니다.

## 파일 구조

- `application.yaml`: 메인 Argo CD Application 정의
- `applicationset.yaml`: 다중 환경/서비스 관리용 ApplicationSet (선택사항)

## 설정 가이드

### 1. Repository URL 업데이트

`application.yaml`의 `source.repoURL`을 실제 GitHub 저장소 URL로 변경하세요:

```yaml
source:
  repoURL: https://github.com/YOUR_ORG/store-management.git
```

### 2. Helm Values 파일 경로 확인

`infra/helm` 디렉토리에 Helm 차트가 있어야 합니다. 없으면 생성하거나 경로를 수정하세요.

### 3. Argo CD에 Application 등록

```bash
# Argo CD CLI로 등록
argocd app create -f infra/argo/application.yaml

# 또는 kubectl로 직접 적용 (Argo CD가 설치된 클러스터에서)
kubectl apply -f infra/argo/application.yaml
```

### 4. 환경별 설정

- `staging`: `values-staging.yaml` 사용
- `production`: `values-production.yaml` 사용

각 환경별로 별도의 Application을 생성하거나 ApplicationSet을 사용할 수 있습니다.

## 참고

- Argo CD 설치 가이드: https://argo-cd.readthedocs.io/
- ApplicationSet 패턴: https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/

