/**
 * GraphQL 테스트 헬퍼 함수
 * 
 * 이 파일은 GraphQL 쿼리/뮤테이션 테스트를 위한 헬퍼 함수들을 제공합니다.
 */

import { DocumentNode, GraphQLFormattedError } from 'graphql';

/**
 * GraphQL 쿼리 실행 결과 타입
 */
export interface GraphQLTestResult<T = any> {
  data?: T;
  errors?: GraphQLFormattedError[];
}

/**
 * GraphQL 쿼리 실행 헬퍼
 * 
 * @param query GraphQL 쿼리 문서
 * @param variables 쿼리 변수
 * @param context GraphQL 컨텍스트 (인증 정보 등)
 */
export async function executeGraphQLQuery<T = any>(
  query: DocumentNode,
  variables?: Record<string, any>,
  context?: any
): Promise<GraphQLTestResult<T>> {
  // 실제 구현에서는 Apollo Server Testing 또는 GraphQL Request를 사용합니다.
  // 여기서는 타입 정의만 제공합니다.
  throw new Error('이 함수는 실제 테스트 환경에서 구현되어야 합니다.');
}

/**
 * GraphQL 뮤테이션 실행 헬퍼
 * 
 * @param mutation GraphQL 뮤테이션 문서
 * @param variables 뮤테이션 변수
 * @param context GraphQL 컨텍스트
 */
export async function executeGraphQLMutation<T = any>(
  mutation: DocumentNode,
  variables?: Record<string, any>,
  context?: any
): Promise<GraphQLTestResult<T>> {
  // 실제 구현에서는 Apollo Server Testing 또는 GraphQL Request를 사용합니다.
  throw new Error('이 함수는 실제 테스트 환경에서 구현되어야 합니다.');
}

/**
 * GraphQL 에러 검증 헬퍼
 */
export function expectGraphQLError(
  result: GraphQLTestResult,
  expectedErrorCode?: string
): void {
  if (!result.errors || result.errors.length === 0) {
    throw new Error('GraphQL 에러가 예상되었지만 에러가 발생하지 않았습니다.');
  }

  if (expectedErrorCode) {
    const error = result.errors.find(
      (e) => e.extensions?.code === expectedErrorCode
    );
    if (!error) {
      throw new Error(
        `예상된 에러 코드 '${expectedErrorCode}'를 찾을 수 없습니다.`
      );
    }
  }
}

/**
 * GraphQL 응답 검증 헬퍼
 */
export function expectGraphQLSuccess<T = any>(
  result: GraphQLTestResult<T>
): asserts result is { data: T } {
  if (result.errors && result.errors.length > 0) {
    throw new Error(
      `GraphQL 에러가 발생했습니다: ${JSON.stringify(result.errors)}`
    );
  }
  if (!result.data) {
    throw new Error('GraphQL 응답에 데이터가 없습니다.');
  }
}

