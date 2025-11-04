# Release Checklist Template

---
version: vYYYY.MM.DD
owner: devops-agent
services:

- gateway
- attendance
- inventory
- sales
- notification

---

## Pre-Release

- [ ] SPEC 및 관련 `/tasks` 완료 상태 확인
- [ ] 모든 PR 리뷰/머지 완료, CI 파이프라인 통과
- [ ] GraphQL Schema Registry Diff 확인
- [ ] 보안 스캔(Trivy, Snyk) 결과 검토
- [ ] 데이터 마이그레이션 스크립트 검증(Staging)
- [ ] QA 리포트 `/evaluations` 반영 여부 확인

## Deployment

- [ ] Argo CD Sync 준비, Helm 값 점검
- [ ] Canary 배포 대상 트래픽 비율 설정(예: 5% → 25% → 100%)
- [ ] 실시간 메트릭 모니터링 (p95, Error Rate, CPU/Memory)
- [ ] 알람 채널 모니터링 활성화

## Post-Release

- [ ] Canary → Stable 승격, 롤백 트리거 비활성화
- [ ] 주요 KPI(근태 승인율, 재고 경보, 매출 집계) 확인
- [ ] Incident 없음/조치 여부 기록
- [ ] 문서 업데이트(`/docs`, `/prompts`) 검토
- [ ] 회고 일정 및 액션 아이템 `/tasks/backlog` 등록
