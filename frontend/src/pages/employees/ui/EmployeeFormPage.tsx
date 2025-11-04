import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { ProtectedRoute } from '@shared/ui/ProtectedRoute';
import { Loading } from '@shared/ui/Loading';
import { Button } from '@shared/ui/Button';

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

const CREATE_EMPLOYEE = gql`
  mutation CreateEmployee($input: CreateEmployeeInput!) {
    createEmployee(input: $input) {
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

const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee($id: ID!, $input: UpdateEmployeeInput!) {
    updateEmployee(id: $id, input: $input) {
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

interface EmployeeFormPageProps {
  employeeId?: string;
}

export const EmployeeFormPage: React.FC<EmployeeFormPageProps> = ({ employeeId }) => {
  const isEdit = !!employeeId;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('ACTIVE');
  const [assignedStoreIds, setAssignedStoreIds] = useState<string[]>([]);
  const [storeIdInput, setStoreIdInput] = useState('');

  const { data, loading: queryLoading } = useQuery(GET_EMPLOYEE, {
    variables: { id: employeeId },
    skip: !employeeId,
    onCompleted: (data) => {
      if (data?.employee) {
        setName(data.employee.name);
        setEmail(data.employee.email || '');
        setPhone(data.employee.phone || '');
        setRole(data.employee.role);
        setEmploymentStatus(data.employee.employmentStatus);
        setAssignedStoreIds(data.employee.assignedStoreIds || []);
      }
    },
  });

  const [createEmployee, { loading: createLoading }] = useMutation(CREATE_EMPLOYEE);
  const [updateEmployee, { loading: updateLoading }] = useMutation(UPDATE_EMPLOYEE);

  const loading = queryLoading || createLoading || updateLoading;

  const handleAddStoreId = () => {
    if (storeIdInput.trim() && !assignedStoreIds.includes(storeIdInput.trim())) {
      setAssignedStoreIds([...assignedStoreIds, storeIdInput.trim()]);
      setStoreIdInput('');
    }
  };

  const handleRemoveStoreId = (storeId: string) => {
    setAssignedStoreIds(assignedStoreIds.filter((id) => id !== storeId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEdit) {
        await updateEmployee({
          variables: {
            id: employeeId,
            input: {
              name: name || undefined,
              email: email || undefined,
              phone: phone || undefined,
              role: role || undefined,
              employmentStatus: employmentStatus || undefined,
              assignedStoreIds: assignedStoreIds.length > 0 ? assignedStoreIds : undefined,
            },
          },
        });
        alert('직원 정보가 수정되었습니다.');
      } else {
        await createEmployee({
          variables: {
            input: {
              name,
              email: email || undefined,
              phone: phone || undefined,
              role,
              assignedStoreIds,
            },
          },
        });
        alert('직원이 생성되었습니다.');
      }
      window.location.href = '/employees';
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류가 발생했습니다.');
    }
  };

  if (isEdit && queryLoading) {
    return <Loading message="직원 정보를 불러오는 중..." />;
  }

  return (
    <ProtectedRoute>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
        <h1>{isEdit ? '직원 정보 수정' : '직원 등록'}</h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>
              이름 <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #ddd',
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #ddd',
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>전화번호</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #ddd',
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>
              역할 <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #ddd',
              }}
            />
          </div>

          {isEdit && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8 }}>고용 상태</label>
              <select
                value={employmentStatus}
                onChange={(e) => setEmploymentStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #ddd',
                }}
              >
                <option value="ACTIVE">활성</option>
                <option value="INACTIVE">비활성</option>
                <option value="TERMINATED">해고</option>
              </select>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>
              할당된 지점 ID <span style={{ color: 'red' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                value={storeIdInput}
                onChange={(e) => setStoreIdInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddStoreId();
                  }
                }}
                placeholder="지점 ID 입력 후 Enter"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #ddd',
                }}
              />
              <Button type="button" onClick={handleAddStoreId}>
                추가
              </Button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {assignedStoreIds.map((storeId) => (
                <span
                  key={storeId}
                  style={{
                    padding: '4px 8px',
                    background: '#f0f0f0',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {storeId}
                  <button
                    type="button"
                    onClick={() => handleRemoveStoreId(storeId)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ff4444',
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="submit" disabled={loading} style={{ flex: 1 }}>
              {loading ? '처리 중...' : isEdit ? '수정' : '생성'}
            </Button>
            <Button
              type="button"
              onClick={() => (window.location.href = '/employees')}
              style={{ flex: 1 }}
            >
              취소
            </Button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
};

