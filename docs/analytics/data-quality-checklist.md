# 데이터 품질 검증 체크리스트

## 개요

본 문서는 Store Management Platform의 데이터 품질을 검증하기 위한 체크리스트입니다.

**업데이트 일자**: 2025-11-07  
**버전**: 1.0  
**담당자**: Analytics Agent

---

## 검증 범주

### 1. 완전성 (Completeness)

#### 근태 데이터
- [ ] 모든 직원의 출퇴근 기록이 존재하는가?
- [ ] `Attendance.date` 필드가 누락되지 않았는가?
- [ ] `Attendance.employeeId`가 모든 레코드에 존재하는가?
- [ ] `Attendance.storeId`가 모든 레코드에 존재하는가?
- [ ] 일별 출근률 계산 시 분모가 0이 아닌가?

**검증 공식**:
```sql
-- 출근률 계산 시 분모 검증
SELECT COUNT(DISTINCT employee_id) as total_employees
FROM employees
WHERE employment_status = 'ACTIVE'
AND assigned_store_ids IS NOT NULL;
```

#### 재고 데이터
- [ ] 모든 활성 SKU에 대해 재고 기록이 존재하는가?
- [ ] `InventoryItem.quantityOnHand`가 NULL이 아닌가?
- [ ] `InventoryItem.reorderPoint`가 설정되어 있는가?
- [ ] 재고 실사 이력(`InventoryAudit`)이 정기적으로 기록되는가?

**검증 공식**:
```sql
-- 재고 기록 누락 검증
SELECT COUNT(*) as missing_inventory
FROM products p
LEFT JOIN inventory_items i ON p.id = i.sku
WHERE p.is_active = true
AND i.store_id IS NULL;
```

#### 매출 데이터
- [ ] 모든 주문에 대해 `Order.totalAmount`가 존재하는가?
- [ ] 모든 주문에 대해 `Order.lineItems`가 비어있지 않은가?
- [ ] `Order.settledAt`이 NULL인 주문의 비율이 허용 범위 내인가?
- [ ] 일별 집계 데이터(`DailySales`)가 모든 날짜에 대해 존재하는가?

**검증 공식**:
```sql
-- 주문 금액 누락 검증
SELECT COUNT(*) as missing_amount
FROM orders
WHERE total_amount IS NULL OR total_amount <= 0;
```

---

### 2. 정확성 (Accuracy)

#### 근태 데이터
- [ ] `Attendance.checkInAt`이 `Attendance.checkOutAt`보다 이전인가?
- [ ] `Attendance.workingHours`가 `checkOutAt - checkInAt`과 일치하는가? (허용 오차: ±0.1시간)
- [ ] `Attendance.status`가 유효한 값인가? (`PENDING`, `APPROVED`, `REJECTED`)
- [ ] 지각 판단 기준(예: 스케줄 시간보다 15분 이상 늦음)이 일관되게 적용되는가?

**검증 공식**:
```sql
-- 근무 시간 계산 오류 검증
SELECT COUNT(*) as invalid_working_hours
FROM attendance
WHERE check_in_at IS NOT NULL
AND check_out_at IS NOT NULL
AND ABS(
  EXTRACT(EPOCH FROM (check_out_at - check_in_at)) / 3600 - working_hours
) > 0.1;
```

#### 재고 데이터
- [ ] `InventoryItem.quantityOnHand`가 음수가 아닌가?
- [ ] `InventoryItem.reserved`가 `quantityOnHand` 이하인가?
- [ ] 재고 실사 이력(`InventoryAudit`)의 `previousQuantity`가 실제 시스템 수량과 일치하는가?
- [ ] 발주 수량이 합리적인 범위 내인가? (예: 0 < 수량 < 10000)

**검증 공식**:
```sql
-- 재고 수량 음수 검증
SELECT COUNT(*) as negative_quantity
FROM inventory_items
WHERE quantity_on_hand < 0;
```

#### 매출 데이터
- [ ] `Order.totalAmount`가 `SUM(LineItem.subtotal)`과 일치하는가? (허용 오차: ±0.01)
- [ ] `LineItem.subtotal`이 `quantity * unitPrice`와 일치하는가?
- [ ] `Order.settledAt`이 `Order.createdAt` 이후인가?
- [ ] 환불 금액이 원래 주문 금액을 초과하지 않는가?

**검증 공식**:
```sql
-- 주문 금액 불일치 검증
SELECT o.order_id, o.total_amount, SUM(li.subtotal) as calculated_total
FROM orders o
JOIN line_items li ON o.order_id = li.order_id
GROUP BY o.order_id, o.total_amount
HAVING ABS(o.total_amount - SUM(li.subtotal)) > 0.01;
```

---

### 3. 일관성 (Consistency)

#### 데이터 간 일관성
- [ ] `Attendance.employeeId`가 `Employee.id`에 존재하는가?
- [ ] `InventoryItem.sku`가 `Product.id`에 존재하는가?
- [ ] `Order.lineItems[].sku`가 `Product.id`에 존재하는가?
- [ ] 지점 ID가 모든 서비스에서 일관되게 사용되는가?

**검증 공식**:
```sql
-- 외래키 무결성 검증
SELECT COUNT(*) as orphaned_attendance
FROM attendance a
LEFT JOIN employees e ON a.employee_id = e.id
WHERE e.id IS NULL;
```

#### 시간적 일관성
- [ ] 일별 집계 데이터가 중복되지 않는가?
- [ ] 주별 집계가 일별 집계의 합과 일치하는가?
- [ ] 월별 집계가 일별 집계의 합과 일치하는가?

**검증 공식**:
```sql
-- 일별/주별 집계 일관성 검증
SELECT 
  date_trunc('week', date) as week_start,
  SUM(total_sales) as daily_sum,
  (SELECT total_sales FROM weekly_sales WHERE week_start = date_trunc('week', date)) as weekly_total
FROM daily_sales
GROUP BY date_trunc('week', date)
HAVING ABS(SUM(total_sales) - (SELECT total_sales FROM weekly_sales WHERE week_start = date_trunc('week', date))) > 0.01;
```

---

### 4. 유효성 (Validity)

#### 데이터 형식 검증
- [ ] 날짜 필드가 ISO-8601 형식인가?
- [ ] ID 필드가 UUID 형식인가?
- [ ] 이메일 주소가 유효한 형식인가?
- [ ] 전화번호가 유효한 형식인가?

**검증 공식**:
```sql
-- 날짜 형식 검증
SELECT COUNT(*) as invalid_dates
FROM attendance
WHERE date !~ '^\d{4}-\d{2}-\d{2}$';
```

#### 비즈니스 규칙 검증
- [ ] 근무 시간이 0시간 이상 24시간 이하인가?
- [ ] 재고 수량이 0 이상인가?
- [ ] 주문 금액이 0보다 큰가?
- [ ] 직원 역할이 유효한 값인가? (`HQ_ADMIN`, `STORE_MANAGER`, `EMPLOYEE`)

**검증 공식**:
```sql
-- 근무 시간 범위 검증
SELECT COUNT(*) as invalid_working_hours
FROM attendance
WHERE working_hours < 0 OR working_hours > 24;
```

---

### 5. 적시성 (Timeliness)

#### 데이터 수집 지연
- [ ] 출퇴근 기록이 실시간으로 수집되는가? (지연: ≤ 1분)
- [ ] 재고 변동이 실시간으로 반영되는가? (지연: ≤ 5분)
- [ ] 매출 데이터가 실시간으로 수집되는가? (지연: ≤ 1분)

#### 집계 지연
- [ ] 일별 집계가 다음 날 오전 9시 이전에 완료되는가?
- [ ] 주별 집계가 다음 주 월요일 오전 9시 이전에 완료되는가?
- [ ] 월별 집계가 다음 달 3일 이전에 완료되는가?

**검증 공식**:
```sql
-- 집계 지연 검증
SELECT 
  MAX(date) as latest_date,
  CURRENT_DATE as today,
  CURRENT_DATE - MAX(date) as delay_days
FROM daily_sales
WHERE CURRENT_DATE - MAX(date) > 1;
```

---

### 6. 유일성 (Uniqueness)

#### 중복 데이터 검증
- [ ] 동일한 `(storeId, employeeId, date)` 조합의 출퇴근 기록이 중복되지 않는가?
- [ ] 동일한 `(storeId, sku)` 조합의 재고 항목이 중복되지 않는가?
- [ ] 동일한 `orderId`의 주문이 중복되지 않는가?

**검증 공식**:
```sql
-- 중복 출퇴근 기록 검증
SELECT store_id, employee_id, date, COUNT(*) as duplicate_count
FROM attendance
GROUP BY store_id, employee_id, date
HAVING COUNT(*) > 1;
```

---

### 7. 데이터 품질 점수

#### 점수 계산

각 검증 항목에 대해 통과/실패를 기록하고, 전체 점수를 계산합니다.

**점수 공식**:
```
데이터 품질 점수 = (통과 항목 수 / 전체 항목 수) * 100
```

#### 목표 점수
- **최소 허용 점수**: 95%
- **목표 점수**: 98%
- **우수 점수**: 99% 이상

---

## 검증 실행 주기

### 일별 검증
- 완전성 (Completeness)
- 정확성 (Accuracy) - 기본 검증
- 적시성 (Timeliness)

### 주별 검증
- 일관성 (Consistency)
- 유효성 (Validity)
- 유일성 (Uniqueness)

### 월별 검증
- 전체 검증 항목 종합 점검
- 데이터 품질 점수 리포트 생성
- 개선 사항 도출

---

## 검증 도구

### Great Expectations

#### 예시: 출근률 계산 검증

```python
import great_expectations as ge
from great_expectations.dataset import SparkDFDataset

# 출근률 분모 검증
expectation = df.expect_column_values_to_not_be_null(
    column="total_employees",
    mostly=1.0
)

# 근무 시간 범위 검증
expectation = df.expect_column_values_to_be_between(
    column="working_hours",
    min_value=0,
    max_value=24
)
```

#### 예시: 주문 금액 일치 검증

```python
# 주문 금액과 라인 아이템 합계 일치 검증
expectation = df.expect_column_pair_values_to_be_equal(
    column_A="total_amount",
    column_B="calculated_total",
    tolerance=0.01
)
```

### SQL 기반 검증

데이터베이스에서 직접 실행할 수 있는 SQL 쿼리를 제공합니다.

---

## 알림 및 대응

### 알림 기준
- 데이터 품질 점수가 95% 미만인 경우
- 중복 데이터가 발견된 경우
- 집계 지연이 1일 이상인 경우
- 외래키 무결성 위반이 발생한 경우

### 대응 프로세스
1. **알림 수신**: Slack/이메일로 알림 수신
2. **원인 분석**: 데이터 품질 이슈 원인 파악
3. **수정 작업**: 데이터 보정 또는 ETL 작업 수정
4. **재검증**: 수정 후 재검증 실행
5. **문서화**: 이슈 및 해결 과정 문서화

---

## 향후 개선 사항

- [ ] 자동화된 데이터 품질 검증 파이프라인 구축
- [ ] Monte Carlo 데이터 품질 모니터링 도입
- [ ] 데이터 품질 대시보드 구축
- [ ] 머신러닝 기반 이상 탐지 모델 통합

---

## 참고

- Analytics Handbook: `docs/analytics/README.md`
- KPI 정의: `docs/analytics/kpi-matrix.md`
- Great Expectations 문서: https://docs.greatexpectations.io/

