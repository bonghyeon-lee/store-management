/**
 * 공통 Mock 데이터
 * 
 * 이 파일은 테스트에서 사용할 공통 Mock 데이터를 제공합니다.
 */

/**
 * Mock Employee 데이터
 */
export const mockEmployee = {
  id: 'EMP-001',
  name: '홍길동',
  email: 'hong@example.com',
  phone: '010-1234-5678',
  role: 'EMPLOYEE',
  storeId: 'STORE-001',
  isActive: true,
};

/**
 * Mock Store 데이터
 */
export const mockStore = {
  id: 'STORE-001',
  name: '강남점',
  address: '서울시 강남구',
  phone: '02-1234-5678',
};

/**
 * Mock Product 데이터
 */
export const mockProduct = {
  id: 'PROD-001',
  name: '상품명',
  category: '카테고리',
  price: 10000,
  description: '상품 설명',
};

/**
 * Mock AttendanceRecord 데이터
 */
export const mockAttendanceRecord = {
  id: 'ATT-001',
  employeeId: 'EMP-001',
  date: '2025-11-05',
  clockIn: '09:00',
  clockOut: '18:00',
  status: 'APPROVED',
};

/**
 * Mock Order 데이터
 */
export const mockOrder = {
  id: 'ORDER-001',
  storeId: 'STORE-001',
  date: '2025-11-05',
  totalAmount: 50000,
  status: 'COMPLETED',
};

/**
 * Mock 데이터 생성 팩토리 함수들
 */
export const createMockEmployee = (overrides?: Partial<typeof mockEmployee>) => ({
  ...mockEmployee,
  ...overrides,
});

export const createMockStore = (overrides?: Partial<typeof mockStore>) => ({
  ...mockStore,
  ...overrides,
});

export const createMockProduct = (overrides?: Partial<typeof mockProduct>) => ({
  ...mockProduct,
  ...overrides,
});

export const createMockAttendanceRecord = (
  overrides?: Partial<typeof mockAttendanceRecord>
) => ({
  ...mockAttendanceRecord,
  ...overrides,
});

export const createMockOrder = (overrides?: Partial<typeof mockOrder>) => ({
  ...mockOrder,
  ...overrides,
});

