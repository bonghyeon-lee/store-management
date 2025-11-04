import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { ProtectedRoute } from '@shared/ui/ProtectedRoute';
import { Loading } from '@shared/ui/Loading';
import { Button } from '@shared/ui/Button';

const GET_EMPLOYEES = gql`
  query GetEmployees($storeId: ID, $role: String, $status: EmploymentStatus) {
    employees(storeId: $storeId, role: $role, status: $status) {
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

const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployee($id: ID!) {
    deleteEmployee(id: $id)
  }
`;

interface Employee {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  employmentStatus: string;
  assignedStoreIds: string[];
  createdAt: string;
  updatedAt: string;
}

export const EmployeeListPage: React.FC = () => {
  const [storeId, setStoreId] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const { data, loading, error, refetch } = useQuery<{ employees: Employee[] }>(
    GET_EMPLOYEES,
    {
      variables: {
        storeId: storeId || undefined,
        role: role || undefined,
        status: status || undefined,
      },
    },
  );

  const [deleteEmployee] = useMutation(DELETE_EMPLOYEE, {
    onCompleted: () => {
      refetch();
    },
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteEmployee({ variables: { id } });
        alert('직원이 삭제되었습니다.');
      } catch (err) {
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  if (loading) return <Loading message="직원 목록을 불러오는 중..." />;
  if (error)
    return (
      <div style={{ padding: 20, color: 'red' }}>
        오류: {error.message}
      </div>
    );

  return (
    <ProtectedRoute>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1>직원 목록</h1>
          <Button onClick={() => (window.location.href = '/employees/new')}>
            직원 추가
          </Button>
        </div>

        <div style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
          <input
            type="text"
            placeholder="지점 ID"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #ddd',
            }}
          />
          <input
            type="text"
            placeholder="역할"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #ddd',
            }}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #ddd',
            }}
          >
            <option value="">전체 상태</option>
            <option value="ACTIVE">활성</option>
            <option value="INACTIVE">비활성</option>
            <option value="TERMINATED">해고</option>
          </select>
          <Button onClick={() => refetch()}>검색</Button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          {data?.employees.map((employee) => (
            <div
              key={employee.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: 16,
              }}
            >
              <h3 style={{ marginTop: 0 }}>{employee.name}</h3>
              <p style={{ margin: '4px 0', fontSize: 14, color: '#666' }}>
                이메일: {employee.email || '없음'}
              </p>
              <p style={{ margin: '4px 0', fontSize: 14, color: '#666' }}>
                전화: {employee.phone || '없음'}
              </p>
              <p style={{ margin: '4px 0', fontSize: 14, color: '#666' }}>
                역할: {employee.role}
              </p>
              <p style={{ margin: '4px 0', fontSize: 14, color: '#666' }}>
                상태: {employee.employmentStatus}
              </p>
              <p style={{ margin: '4px 0', fontSize: 14, color: '#666' }}>
                지점: {employee.assignedStoreIds.join(', ') || '없음'}
              </p>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <Button
                  onClick={() => (window.location.href = `/employees/${employee.id}`)}
                  style={{ flex: 1 }}
                >
                  상세
                </Button>
                <Button
                  onClick={() => (window.location.href = `/employees/${employee.id}/edit`)}
                  style={{ flex: 1 }}
                >
                  수정
                </Button>
                <Button
                  onClick={() => handleDelete(employee.id)}
                  style={{ flex: 1, background: '#ff4444', color: 'white' }}
                >
                  삭제
                </Button>
              </div>
            </div>
          ))}
        </div>

        {data?.employees.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
            직원이 없습니다.
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

