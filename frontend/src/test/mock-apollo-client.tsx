/**
 * Apollo Client Mock 설정
 * 
 * 프론트엔드 테스트에서 Apollo Client를 Mock하기 위한 유틸리티
 */

import { MockedProvider, MockedProviderProps } from '@apollo/client/testing';
import { ReactNode } from 'react';

/**
 * GraphQL 쿼리 Mock 생성 헬퍼
 */
export function createMockQuery<TData = any>(
  query: any,
  variables?: Record<string, any>,
  data?: TData
) {
  return {
    request: {
      query,
      variables,
    },
    result: {
      data,
    },
  };
}

/**
 * GraphQL 뮤테이션 Mock 생성 헬퍼
 */
export function createMockMutation<TData = any>(
  mutation: any,
  variables?: Record<string, any>,
  data?: TData
) {
  return {
    request: {
      query: mutation,
      variables,
    },
    result: {
      data,
    },
  };
}

/**
 * GraphQL 에러 Mock 생성 헬퍼
 */
export function createMockError(
  query: any,
  variables?: Record<string, any>,
  errors?: any[]
) {
  return {
    request: {
      query,
      variables,
    },
    result: {
      errors,
    },
  };
}

/**
 * MockedProvider를 사용한 테스트 래퍼 컴포넌트
 */
export function TestApolloProvider({
  mocks,
  children,
  ...props
}: {
  mocks?: MockedProviderProps['mocks'];
  children: ReactNode;
} & Omit<MockedProviderProps, 'mocks' | 'children'>) {
  return (
    <MockedProvider mocks={mocks} {...props}>
      {children}
    </MockedProvider>
  );
}

