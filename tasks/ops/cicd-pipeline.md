---
title: "[Ops] CI/CD Pipeline Bootstrap"
owner: devops-agent
status: todo
priority: medium
due: 2025-12-12
related_prompts:
  - ../../prompts/ops-incident-review.md
  - ../../prompts/release-pipeline-design.md
---

## 목적

- GitHub Actions, Docker, Argo CD를 이용한 기본 CI/CD 파이프라인을 구성하고 보안/품질 검사를 자동화합니다.

## 완료 기준

- GitHub Actions 워크플로 (`.github/workflows/main.yml`) 초안 작성
- Docker 이미지 빌드 & Trivy 스캔 스텝 추가
- Argo CD Application 매니페스트 샘플(`infra/argo/`) 생성
- Release Checklist(`docs/templates/release-checklist.md`)와 연동

## 산출물

- CI/CD 파이프라인 문서: `docs/ops/README.md` 업데이트
- Argo CD 샘플 매니페스트
- 파이프라인 실행 로그 및 결과 요약

## 검증

- Dummy 서비스 빌드/배포 테스트
- 보안 스캔 결과 회신 및 예외 관리
- DevOps & QA 에이전트 합동 리뷰
