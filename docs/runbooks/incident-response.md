# Incident Response Runbook

## 목적

- 근태/재고/매출 서비스에서 장애가 발생했을 때 신속하게 대응하기 위한 절차를 정의합니다.

## 준비 사항

- PagerDuty/Slack On-call 채널 모니터링
- 대시보드: Grafana `Store Platform - SLO`, Kibana `service:error`
- 접근 권한: Kubernetes `kubectl`, Grafana, Loki/Elastic, Feature Flag 도구

## 대응 절차

1. **경보 확인**
   - Alertmanager 알람 티켓 수신 → 심각도 확인(P1~P3)
   - 장애 서비스(Attendance/Inventory/Sales/Notification/Gateway) 식별
2. **진단**
   - Grafana에서 해당 서비스의 `p95 latency`, `error rate`, `traffic` 확인
   - 최근 배포 여부 확인(Argo CD, Git SHA)
   - Kibana/Loki에서 에러 로그 필터링(`traceId`, `storeId` 중심)
   - 필요 시 `kubectl describe pod`, `kubectl logs`로 추가 정보 수집
3. **완화**
   - 롤백: Argo Rollouts로 이전 버전으로 되돌리기
   - 트래픽 전환: Feature Flag로 문제 기능 비활성화
   - Scale-out: HPA 수동 조정 또는 캐시 재시작
4. **커뮤니케이션**
   - Slack #incident 채널에 상황 공유, ETA 업데이트
   - 고객 영향도, 임시 조치, 예상 복구 시간을 문서화
5. **해결 후**
   - 근본 원인 분석(RCA) 문서 초안 작성
   - `/evaluations/<release>/incident-<date>.md` 갱신
   - 관련 태스크 생성(`/tasks/ops/`) 및 후속 액션 트래킹

## 체크리스트

- [ ] 알람 티켓에 Incident Commander 지정
- [ ] 복구 완료 후 알람 사일런싱 확인
- [ ] 관련 로그/메트릭/트레이스 첨부
- [ ] 커뮤니케이션 요약 및 타임라인 기록

## 참고 문서

- 배포 정책: `../ops/README.md`
- 품질 평가: `../../evaluations/README.md`
- 요구사항: `../../SPEC.md`
