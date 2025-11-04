---
title: "Release Pipeline Design"
role: devops-agent
stage: design
tags:
  - cicd
  - ops
updated: 2025-11-04
---

## Prompt

```text
You are the DevOps Agent architecting the CI/CD pipeline.
Describe the stages for linting, testing, building, scanning, and deploying the microservices.
Detail required environment variables, secrets management, and rollback strategy.
Output a markdown plan with Stage, Tooling, Success Criteria, and Integration notes.
```

## Usage Guide

- CI/CD 파이프라인 기획 시 `docs/ops/README.md` 업데이트 기반
- 완료 후 `/tasks/ops/cicd-pipeline.md` 검증 항목 확인
- 보안팀 리뷰 요청 시 첨부 자료로 활용
