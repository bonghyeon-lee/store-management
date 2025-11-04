import { gql,useQuery  } from '@apollo/client';
import { Button } from '@shared/ui/Button';
import { Loading } from '@shared/ui/Loading';
import { ProtectedRoute } from '@shared/ui/ProtectedRoute';
import React from 'react';

const GET_EMPLOYEE = gql`
  query GetEmployee($id: ID!) {
    employee(id: $id) {
      id
      name
      email
      phone
      role
      employmentStatus
      assignedStoreIds
      createdAt
      updatedAt
    }
  }
`;

interface EmployeeDetailPageProps {
  employeeId: string;
}

export const EmployeeDetailPage: React.FC<EmployeeDetailPageProps> = ({ employeeId }) => {
  const { data, loading, error } = useQuery(GET_EMPLOYEE, {
    variables: { id: employeeId },
    errorPolicy: 'all',
  });

  if (loading) return <Loading message="직원 정보를 불러오는 중..." />;
  if (error) return <div style={{ padding: 20, color: 'red' }}>오류: {error.message}</div>;

  const employee = data?.employee;
  if (!employee) {
    return <div style={{ padding: 20 }}>직원을 찾을 수 없습니다.</div>;
  }

  return (
    <ProtectedRoute>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1>직원 상세 정보</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={() => (window.location.href = `/employees/${employeeId}/edit`)}>
              수정
            </Button>
            <Button onClick={() => (window.location.href = '/employees')}>목록</Button>
          </div>
        </div>

        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: 20,
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <strong style={{ display: 'inline-block', width: 120 }}>ID:</strong>
            <span>{employee.id}</span>
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong style={{ display: 'inline-block', width: 120 }}>이름:</strong>
            <span>{employee.name}</span>
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong style={{ display: 'inline-block', width: 120 }}>이메일:</strong>
            <span>{employee.email || '없음'}</span>
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong style={{ display: 'inline-block', width: 120 }}>전화번호:</strong>
            <span>{employee.phone || '없음'}</span>
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong style={{ display: 'inline-block', width: 120 }}>역할:</strong>
            <span>{employee.role}</span>
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong style={{ display: 'inline-block', width: 120 }}>고용 상태:</strong>
            <span>{employee.employmentStatus}</span>
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong style={{ display: 'inline-block', width: 120 }}>할당된 지점:</strong>
            <span>
              {employee.assignedStoreIds.length > 0 ? employee.assignedStoreIds.join(', ') : '없음'}
            </span>
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong style={{ display: 'inline-block', width: 120 }}>생성일:</strong>
            <span>{employee.createdAt}</span>
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong style={{ display: 'inline-block', width: 120 }}>수정일:</strong>
            <span>{employee.updatedAt}</span>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};
