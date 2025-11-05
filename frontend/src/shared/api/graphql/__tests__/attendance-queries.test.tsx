/**
 * Attendance GraphQL 쿼리 훅 테스트 예시
 *
 * 이 파일은 GraphQL 쿼리를 사용하는 컴포넌트를 테스트하는 방법을 보여줍니다.
 * Apollo Client의 MockedProvider를 사용하여 GraphQL 응답을 모킹합니다.
 */

import { gql, useQuery } from '@apollo/client';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createMockQuery, TestApolloProvider } from '../../../../test/mock-apollo-client';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
}

// 테스트용 쿼리
const GET_EMPLOYEES = gql`
  query GetEmployees($storeId: ID) {
    employees(storeId: $storeId) {
      id
      name
      email
      role
    }
  }
`;

// 테스트용 컴포넌트
function EmployeeList({ storeId }: { storeId?: string }) {
  const { data, loading, error } = useQuery(GET_EMPLOYEES, {
    variables: { storeId },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>직원 목록</h2>
      {data?.employees.map((employee: Employee) => (
        <div key={employee.id} data-testid={`employee-${employee.id}`}>
          {employee.name} ({employee.role})
        </div>
      ))}
    </div>
  );
}

describe('Attendance Queries', () => {
  it('should fetch and display employees', async () => {
    const mocks = [
      createMockQuery(
        GET_EMPLOYEES,
        { storeId: '1' },
        {
          employees: [
            { id: '1', name: '홍길동', email: 'hong@example.com', role: 'MANAGER' },
            { id: '2', name: '김철수', email: 'kim@example.com', role: 'EMPLOYEE' },
          ],
        },
      ),
    ];

    render(
      <TestApolloProvider mocks={mocks}>
        <EmployeeList storeId="1" />
      </TestApolloProvider>,
    );

    // 로딩 상태 확인
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // 데이터 로드 후 확인
    await waitFor(() => {
      expect(screen.getByText('직원 목록')).toBeInTheDocument();
      expect(screen.getByTestId('employee-1')).toHaveTextContent('홍길동 (MANAGER)');
      expect(screen.getByTestId('employee-2')).toHaveTextContent('김철수 (EMPLOYEE)');
    });
  });

  it('should handle error state', async () => {
    const mocks = [
      {
        request: {
          query: GET_EMPLOYEES,
          variables: { storeId: '1' },
        },
        error: new Error('Network error'),
      },
    ];

    render(
      <TestApolloProvider mocks={mocks}>
        <EmployeeList storeId="1" />
      </TestApolloProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Error: Network error/)).toBeInTheDocument();
    });
  });

  it('should handle empty result', async () => {
    const mocks = [
      createMockQuery(
        GET_EMPLOYEES,
        { storeId: '1' },
        {
          employees: [],
        },
      ),
    ];

    render(
      <TestApolloProvider mocks={mocks}>
        <EmployeeList storeId="1" />
      </TestApolloProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('직원 목록')).toBeInTheDocument();
    });
  });
});
