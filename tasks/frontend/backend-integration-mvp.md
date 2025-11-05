---
title: "[Frontend] 최신 백엔드 기능 연동 MVP"
owner: frontend-team
status: todo
priority: high
due: 2025-12-15
related_prompts:
  - ../prompts/frontend-wireframes.md
---

## 목적

최신 커밋(435cee3)에서 추가된 백엔드 기능들과 프론트엔드를 연동합니다. Gateway 서비스의 JWT 인증 시스템, Attendance Service의 확장된 기능(Employee/Report resolver), Inventory Service의 Purchase Order 기능, Sales Service의 확장된 리포트 기능을 프론트엔드에서 사용할 수 있도록 구현합니다.

## 완료 기준

### 1. JWT 인증 시스템 구현

- [x] Apollo Client에 인증 헤더 추가 (setContext)
- [x] JWT 토큰 저장소 구현 (localStorage/sessionStorage)
- [x] 로그인 페이지 구현
- [x] 로그인 폼 컴포넌트
- [ ] 토큰 만료 처리 및 자동 갱신 로직 (에러 처리만 구현됨, 자동 갱신은 TODO)
- [x] 인증 상태 관리 (Context API 또는 상태 관리 라이브러리)
- [x] 로그아웃 기능
- [x] 인증이 필요한 페이지 라우트 가드 구현
- [x] 401 에러 처리 및 자동 로그아웃

### 2. Attendance Service 연동

#### 2.1 Employee 관리 기능

- [x] 직원 목록 조회 페이지 구현
  - GraphQL Query: `employees(storeId, role, status)`
  - 필터링 기능 (지점, 역할, 고용 상태)
  - 직원 카드/테이블 컴포넌트
- [x] 직원 상세 조회 기능
  - GraphQL Query: `employee(id)`
  - 직원 정보 표시 컴포넌트
- [x] 직원 생성 기능
  - GraphQL Mutation: `createEmployee(input)`
  - 직원 등록 폼 컴포넌트
- [x] 직원 정보 수정 기능
  - GraphQL Mutation: `updateEmployee(id, input)`
  - 직원 수정 폼 컴포넌트
- [x] 직원 삭제/비활성화 기능
  - GraphQL Mutation: `deleteEmployee(id)`
  - 확인 다이얼로그 컴포넌트 (alert 사용)

#### 2.2 Attendance 기능 확장

- [x] 출근 기록 기능
  - GraphQL Mutation: `checkIn(input)`
  - 출근 버튼 컴포넌트 (AttendanceRecordsPage에 구현됨)
- [x] 퇴근 기록 기능
  - GraphQL Mutation: `checkOut(input)`
  - 퇴근 버튼 컴포넌트 (AttendanceRecordsPage에 구현됨)
- [x] 근태 승인/거부 기능
  - GraphQL Mutation: `approveAttendance`, `rejectAttendance`
  - 승인/거부 버튼 컴포넌트 (PendingApprovalsPage에 구현됨)
- [x] 근태 수정 요청 기능
  - GraphQL Mutation: `requestAttendanceCorrection`
  - 수정 요청 폼 컴포넌트 (PendingApprovalsPage에 구현됨)
- [x] 출퇴근 기록 목록 조회
  - GraphQL Query: `attendanceRecords(storeId, employeeId, startDate, endDate, status)`
  - 기록 목록 테이블 컴포넌트 (AttendanceRecordsPage에 구현됨)
  - 날짜 범위 필터 컴포넌트 (DateRangePicker 사용)
- [x] 승인 대기 목록 조회
  - GraphQL Query: `pendingApprovals(storeId, managerId)`
  - 대기 목록 컴포넌트 (PendingApprovalsPage에 구현됨)

#### 2.3 Attendance Report 기능

- [x] 일별 근태 리포트 페이지
  - GraphQL Query: `dailyAttendanceReport(storeId, date)`
  - 리포트 카드 컴포넌트 (출근률, 지각 수, 결근 수, 근무 시간 등) (DailyAttendanceReportPage에 구현됨)
  - 날짜 선택 컴포넌트 (DatePicker 사용)
  - 직원별 통계 테이블 컴포넌트
- [x] 주별 근태 리포트 페이지
  - GraphQL Query: `weeklyAttendanceReport(storeId, weekStart)`
  - 주별 리포트 컴포넌트 (WeeklyAttendanceReportPage에 구현됨)
  - 일별 리포트 목록 표시
  - 주 시작일 선택 컴포넌트 (DatePicker 사용)
- [ ] 리포트 데이터 시각화
  - 출근률 차트 컴포넌트
  - 근무 시간 추이 차트 컴포넌트
  - 지각/결근 통계 차트 컴포넌트

### 3. Inventory Service 연동

#### 3.1 Purchase Order 기능

- [x] 발주 목록 조회 페이지
  - GraphQL Query: `purchaseOrders(storeId, sku, status)`
  - 발주 목록 테이블 컴포넌트 (PurchaseOrdersListPage에 구현됨)
  - 상태 필터 컴포넌트 (PENDING, APPROVED, REJECTED, RECEIVED)
- [x] 발주 상세 조회 기능
  - GraphQL Query: `purchaseOrder(id)`
  - 발주 상세 정보 컴포넌트 (PurchaseOrderDetailPage에 구현됨)
- [x] 발주 생성 기능
  - GraphQL Mutation: `createPurchaseOrder(input)`
  - 발주 요청 폼 컴포넌트 (PurchaseOrderFormPage에 구현됨)
  - SKU 선택 컴포넌트
  - 수량 입력 컴포넌트
- [x] 발주 승인 기능
  - GraphQL Mutation: `approvePurchaseOrder(id, approvedQuantity, notes)`
  - 승인 폼 컴포넌트 (PurchaseOrderDetailPage에 구현됨)
- [x] 발주 거부 기능
  - GraphQL Mutation: `rejectPurchaseOrder(id, notes)`
  - 거부 폼 컴포넌트 (PurchaseOrderDetailPage에 구현됨)
- [x] 입고 처리 기능
  - GraphQL Mutation: `receiveInventory(purchaseOrderId, receivedQuantity, notes)`
  - 입고 처리 폼 컴포넌트 (PurchaseOrderDetailPage에 구현됨)

#### 3.2 Inventory 기능 확장

- [ ] 재고 실사 입력 기능
  - GraphQL Mutation: `submitInventoryCount(input)`
  - 실사 입력 폼 컴포넌트
- [ ] 안전재고 임계치 설정 기능
  - GraphQL Mutation: `setReorderPoint(input)`
  - 임계치 설정 폼 컴포넌트
- [ ] 리오더 추천 목록 조회
  - GraphQL Query: `reorderRecommendations(storeId, sku)`
  - 추천 목록 컴포넌트
  - 우선순위 표시
  - 긴급도 색상 구분 (HIGH, MEDIUM, LOW)
- [ ] 재고 실사 이력 조회
  - GraphQL Query: `inventoryAuditHistory(storeId, sku, startDate, endDate)`
  - 실사 이력 테이블 컴포넌트

### 4. Sales Service 연동

#### 4.1 매출 리포트 확장 기능

- [x] 일별 매출 리포트 페이지
  - GraphQL Query: `dailySales(storeId, date)`
  - 매출 요약 카드 컴포넌트 (총 매출, 거래 건수, 평균 거래액) (DailySalesPage에 구현됨)
  - 채널별 매출 분류 컴포넌트
  - 날짜 선택 컴포넌트 (DatePicker 사용)
- [x] 주별 매출 리포트 페이지
  - GraphQL Query: `weeklySales(storeId, weekStart)`
  - 주별 리포트 컴포넌트 (WeeklySalesPage에 구현됨)
  - 전주 대비 증감률 표시
  - 일별 상세 데이터 표시
  - 주 시작일 선택 컴포넌트 (DatePicker 사용)
- [x] 월별 매출 리포트 페이지
  - GraphQL Query: `monthlySales(storeId, year, month)`
  - 월별 리포트 컴포넌트 (MonthlySalesPage에 구현됨)
  - 전월 대비 증감률 표시
  - 일별 상세 데이터 표시
  - 년/월 선택 컴포넌트 (DatePicker 사용)
- [x] 매출 대시보드 페이지
  - GraphQL Query: `salesDashboard(storeId, startDate, endDate)`
  - 대시보드 레이아웃 구성 (SalesDashboardPage에 구현됨)
  - 총 매출, 거래 건수, 평균 거래액 요약
  - 지점별 요약 컴포넌트
  - 상위/하위 성과 지점 컴포넌트
  - 채널별 매출 분포 컴포넌트
  - 기간별 트렌드 차트 컴포넌트 (테이블로 표시, 차트는 미구현)
  - 기간 선택 컴포넌트 (DateRangePicker 사용)

#### 4.2 매출 데이터 시각화

- [ ] 매출 트렌드 차트 컴포넌트
  - 라인 차트 또는 바 차트
  - 기간별 매출 추이 표시
- [ ] 채널별 매출 분포 차트 컴포넌트
  - 파이 차트 또는 도넛 차트
  - 채널별 비율 표시
- [ ] 지점별 매출 비교 차트 컴포넌트
  - 바 차트 또는 히트맵
  - 지점별 성과 비교

#### 4.3 주문 관리 기능

- [ ] 주문 목록 조회 페이지
  - GraphQL Query: `orders(storeId, startDate, endDate, channel, status)`
  - 주문 목록 테이블 컴포넌트
  - 필터 컴포넌트 (채널, 상태, 날짜 범위)
- [ ] 주문 상세 조회 기능
  - GraphQL Query: `order(storeId, orderId)`
  - 주문 상세 정보 컴포넌트
  - 라인 아이템 목록 표시
- [ ] 주문 환불 기능
  - GraphQL Mutation: `refundOrder(storeId, orderId, amount)`
  - 환불 폼 컴포넌트

### 5. GraphQL 쿼리/뮤테이션 정의

- [x] Attendance Service GraphQL 쿼리 정의
  - Employee 관련 쿼리/뮤테이션 (attendance.graphql에 정의됨)
  - Attendance 관련 쿼리/뮤테이션 (attendance.graphql에 정의됨)
  - Report 관련 쿼리 (attendance.graphql에 정의됨)
- [x] Inventory Service GraphQL 쿼리 정의
  - Purchase Order 관련 쿼리/뮤테이션 (inventory.graphql에 정의됨)
  - Inventory 관련 쿼리/뮤테이션 (inventory.graphql에 정의됨)
- [x] Sales Service GraphQL 쿼리 정의
  - Sales 리포트 관련 쿼리 (sales.graphql에 정의됨)
  - Order 관련 쿼리/뮤테이션 (sales.graphql에 정의됨)
- [ ] GraphQL Code Generator 설정
  - 타입 자동 생성
  - 쿼리/뮤테이션 타입 정의

### 6. 공통 컴포넌트 및 유틸리티

- [x] 날짜 선택 컴포넌트 (DatePicker) (shared/ui/DatePicker.tsx)
- [x] 날짜 범위 선택 컴포넌트 (DateRangePicker) (shared/ui/DateRangePicker.tsx)
- [x] 로딩 상태 컴포넌트 (shared/ui/Loading.tsx)
- [x] 에러 처리 컴포넌트 (shared/ui/ErrorBoundary.tsx)
- [x] 빈 상태 컴포넌트 (Empty State) (shared/ui/EmptyState.tsx)
- [x] 확인 다이얼로그 컴포넌트 (alert 사용 중, 전용 컴포넌트는 미구현)
- [ ] 폼 검증 유틸리티
- [x] 날짜 포맷팅 유틸리티 (shared/lib/utils/date.ts)
- [x] 숫자 포맷팅 유틸리티 (통화 형식) (shared/lib/utils/currency.ts)

## 산출물

- React 컴포넌트 코드
- GraphQL 쿼리/뮤테이션 정의 파일
- 인증 관련 유틸리티 및 컨텍스트
- 타입 정의 파일 (GraphQL Code Generator 출력)
- UI 컴포넌트 스토리북 문서
- 사용자 가이드 문서

## 검증

- [ ] 컴포넌트 단위 테스트 작성
- [ ] GraphQL 연동 통합 테스트 작성
- [ ] 인증 플로우 테스트
- [ ] E2E 테스트 작성 (Cypress)
- [ ] 접근성 테스트 (a11y)
- [ ] 반응형 디자인 테스트
- [ ] 코드 리뷰 완료

## 기술 스택

- React 18+
- Apollo Client (GraphQL)
- TypeScript
- GraphQL Code Generator
- 차트 라이브러리 (Recharts 또는 Chart.js)
- 날짜 처리 라이브러리 (date-fns 또는 dayjs)

## 참고사항

- JWT 토큰은 localStorage 또는 httpOnly cookie로 저장 (보안 고려)
- 토큰 만료 시 자동 갱신 또는 재로그인 처리
- 인증이 필요한 모든 GraphQL 요청에 Authorization 헤더 포함
- 에러 처리: 401 에러 시 로그아웃 처리, 403 에러 시 권한 부족 메시지 표시
- 날짜 형식: ISO-8601 (YYYY-MM-DD, YYYY-MM-DDTHH:mm:ss)
- 통화 형식: 한국 원화 (₩) 표시
- 차트는 반응형으로 구현하여 모바일에서도 확인 가능하도록

## 우선순위

1. **High**: JWT 인증 시스템 구현 (다른 모든 기능의 전제 조건)
2. **High**: Employee 관리 기능 (Attendance Service)
3. **High**: Purchase Order 기능 (Inventory Service)
4. **Medium**: Attendance Report 기능
5. **Medium**: Sales 리포트 확장 기능
6. **Low**: 차트 시각화 개선 (기본 차트 구현 후)
