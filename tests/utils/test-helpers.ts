/**
 * 공통 테스트 헬퍼 함수
 * 
 * 이 파일은 모든 테스트에서 공통으로 사용할 수 있는 유틸리티 함수들을 제공합니다.
 */

/**
 * 테스트용 JWT 토큰 생성
 */
export function createTestToken(
  userId: string = 'test-user',
  role: string = 'HQ_ADMIN',
  storeIds: string[] = ['STORE-001']
): string {
  // 실제 구현에서는 jsonwebtoken을 사용하지만,
  // 여기서는 간단한 mock 토큰을 반환합니다.
  // 실제 테스트에서는 환경에 맞는 JWT 라이브러리를 사용하세요.
  return `mock-token-${userId}-${role}`;
}

/**
 * 테스트용 사용자 컨텍스트 생성
 */
export interface TestUserContext {
  userId: string;
  role: string;
  storeIds: string[];
}

export function createTestUserContext(
  userId: string = 'test-user',
  role: string = 'HQ_ADMIN',
  storeIds: string[] = ['STORE-001']
): TestUserContext {
  return {
    userId,
    role,
    storeIds,
  };
}

/**
 * 테스트용 날짜 생성
 */
export function createTestDate(daysOffset: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

/**
 * 테스트용 UUID 생성 (간단한 버전)
 */
export function createTestId(prefix: string = 'TEST'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 테스트 데이터 정리 헬퍼
 */
export function clearTestData(dataStore: Map<string, any>): void {
  dataStore.clear();
}

