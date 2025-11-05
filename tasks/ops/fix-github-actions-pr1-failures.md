---
title: "[Ops] GitHub Actions PR #1 실패 원인 분석 및 수정"
owner: devops-agent
status: completed
priority: high
due: 2025-11-06
completed: 2025-11-05
related_tasks:
  - ./fix-github-actions-failures-2025-11-04.md
  - ./fix-github-actions-failure-0f75c29.md
  - ./cicd-pipeline.md
---

## 문제 분석

PR #1 (Update GitHub Actions workflow and ESLint configuration)에서 GitHub Actions가 실패했습니다.

### 주요 문제점

1. **Trivy 이미지 참조 오류**
   - `steps.meta.outputs.tags`는 여러 태그를 줄바꿈으로 구분한 문자열
   - Trivy action은 단일 이미지 참조를 기대하므로 첫 번째 태그만 사용하거나 빌드된 이미지 ID를 사용해야 함
   - 현재: `image-ref: ${{ steps.meta.outputs.tags }}` (여러 태그가 포함된 문자열)

2. **Trivy 스캔 결과 파일 확인 로직**
   - `hashFiles('trivy-results.sarif')`는 파일이 존재하지 않으면 빈 문자열을 반환하지만, 더 명확한 체크가 필요
   - 파일 존재 여부를 더 명확하게 확인해야 함

3. **빌드된 이미지 참조 문제**
   - `load: true`로 설정되어 이미지가 로컬에 로드되지만, Trivy는 정확한 이미지 태그나 ID가 필요
   - 빌드 단계에서 이미지 ID를 추출하여 사용하는 것이 더 안정적

## 해결 방안

### 1. Trivy 이미지 참조 수정

빌드 단계에서 이미지 ID를 추출하거나, 첫 번째 태그만 사용하도록 수정:

```yaml
# 옵션 1: 빌드 단계에서 이미지 ID 사용
- name: Build Docker image
  id: build
  uses: docker/build-push-action@v5
  with:
    # ... 기존 설정 ...
    outputs: type=image,id=imgid  # 이미지 ID 저장

- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ${{ steps.build.outputs.imageid }}
    # 또는
    image-ref: ${{ fromJSON(steps.meta.outputs.tags)[0] }}  # 첫 번째 태그만 사용
```

### 2. Trivy 스캔 결과 파일 확인 개선

파일 존재 여부를 더 명확하게 확인:

```yaml
- name: Upload Trivy results to GitHub Security
  uses: github/codeql-action/upload-sarif@v3
  if: always() && steps.trivy-scan.outcome == 'success' && hashFiles('trivy-results.sarif') != ''
  with:
    sarif_file: "trivy-results.sarif"
```

또는 더 명확한 체크:

```yaml
- name: Upload Trivy results to GitHub Security
  if: always() && steps.trivy-scan.outcome == 'success'
  run: |
    if [ -f "trivy-results.sarif" ] && [ -s "trivy-results.sarif" ]; then
      # 파일이 존재하고 비어있지 않은 경우에만 업로드
    fi
```

### 3. 이미지 태그 추출 로직 개선

첫 번째 태그만 추출하거나, 빌드된 이미지 ID 사용:

```yaml
- name: Extract first image tag
  id: image-tag
  run: |
    TAGS="${{ steps.meta.outputs.tags }}"
    FIRST_TAG=$(echo "$TAGS" | head -n 1)
    echo "tag=$FIRST_TAG" >> $GITHUB_OUTPUT

- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ${{ steps.image-tag.outputs.tag }}
```

## 작업 항목

### [x] 1. main.yml 수정

- [x] Trivy 이미지 참조 수정 (첫 번째 태그 추출)
  - `Extract first image tag` 단계 추가하여 첫 번째 태그만 추출
  - Trivy action에서 `steps.image-tag.outputs.tag` 사용
- [x] Trivy 스캔 결과 파일 확인 로직 개선
  - SARIF 업로드 단계에서 `hashFiles('trivy-results.sarif') != ''` 체크 유지
  - Trivy summary 단계에서 파일 존재 및 비어있지 않은지 체크 (`-f` 및 `-s` 옵션)
- [x] Trivy summary 단계에서 이미지 참조 수정
  - `steps.meta.outputs.tags` 대신 `steps.image-tag.outputs.tag` 사용

### [ ] 2. 테스트 및 검증

- [ ] 수정된 워크플로우 커밋 및 푸시
- [ ] GitHub Actions에서 실행 확인
- [ ] Trivy 스캔이 정상적으로 실행되는지 확인
- [ ] SARIF 파일이 올바르게 생성되고 업로드되는지 확인

## 수정 내용

### 1. 첫 번째 이미지 태그 추출 단계 추가

```yaml
- name: Extract first image tag
  id: image-tag
  run: |
    TAGS="${{ steps.meta.outputs.tags }}"
    FIRST_TAG=$(echo "$TAGS" | head -n 1)
    echo "tag=$FIRST_TAG" >> $GITHUB_OUTPUT
    echo "Using image tag: $FIRST_TAG"
```

### 2. Trivy 이미지 참조 수정

```yaml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ${{ steps.image-tag.outputs.tag }}  # 첫 번째 태그만 사용
```

### 3. Trivy summary 개선

```yaml
- name: Trivy scan summary
  if: always()
  run: |
    if [ -f "trivy-results.sarif" ] && [ -s "trivy-results.sarif" ]; then
      echo "Running Trivy scan summary for image: ${{ steps.image-tag.outputs.tag }}"
      trivy image --exit-code 0 --severity CRITICAL,HIGH --format table ${{ steps.image-tag.outputs.tag }} || true
    else
      echo "Trivy scan results not available (file missing or empty)"
    fi
```

## 참고 사항

- `docker/metadata-action`의 `outputs.tags`는 여러 줄 문자열 (줄바꿈으로 구분)
- Trivy action은 단일 이미지 참조를 기대
- `load: true`를 사용하면 이미지가 로컬에 로드되지만, 정확한 태그나 ID가 필요
- `docker/build-push-action`의 `outputs.imageid`를 사용할 수 있음

## 예상 결과

수정 후 다음이 성공적으로 실행되어야 함:

- ✅ Docker 이미지 빌드 성공
- ✅ Trivy 스캔이 정상적으로 실행됨
- ✅ SARIF 파일이 올바르게 생성되고 업로드됨
- ✅ Trivy summary가 정상적으로 표시됨

