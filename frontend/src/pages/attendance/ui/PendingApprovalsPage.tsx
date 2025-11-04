import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { ProtectedRoute } from '@shared/ui/ProtectedRoute';
import { Loading } from '@shared/ui/Loading';
import { Button } from '@shared/ui/Button';
import { formatDateTime } from '@shared/lib/utils/date';

const GET_PENDING_APPROVALS = gql`
  query GetPendingApprovals($storeId: ID, $managerId: ID) {
    pendingApprovals(storeId: $storeId, managerId: $managerId) {
      storeId
      employeeId
      date
      checkInAt
      checkOutAt
      status
      notes
      workingHours
    }
  }
`;

const APPROVE_ATTENDANCE = gql`
  mutation ApproveAttendance($storeId: ID!, $employeeId: ID!, $date: String!, $notes: String) {
    approveAttendance(storeId: $storeId, employeeId: $employeeId, date: $date, notes: $notes) {
      storeId
      employeeId
      date
      checkInAt
      checkOutAt
      status
      notes
      workingHours
    }
  }
`;

const REJECT_ATTENDANCE = gql`
  mutation RejectAttendance($storeId: ID!, $employeeId: ID!, $date: String!, $notes: String!) {
    rejectAttendance(storeId: $storeId, employeeId: $employeeId, date: $date, notes: $notes) {
      storeId
      employeeId
      date
      checkInAt
      checkOutAt
      status
      notes
      workingHours
    }
  }
`;

const REQUEST_CORRECTION = gql`
  mutation RequestAttendanceCorrection($storeId: ID!, $employeeId: ID!, $date: String!, $notes: String!) {
    requestAttendanceCorrection(storeId: $storeId, employeeId: $employeeId, date: $date, notes: $notes) {
      storeId
      employeeId
      date
      checkInAt
      checkOutAt
      status
      notes
      workingHours
    }
  }
`;

interface AttendanceRecord {
  storeId: string;
  employeeId: string;
  date: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  status: string;
  notes: string | null;
  workingHours: number | null;
}

export const PendingApprovalsPage: React.FC = () => {
  const [storeId, setStoreId] = useState('');
  const [managerId, setManagerId] = useState('');

  const { data, loading, error, refetch } = useQuery<{
    pendingApprovals: AttendanceRecord[];
  }>(GET_PENDING_APPROVALS, {
    variables: {
      storeId: storeId || undefined,
      managerId: managerId || undefined,
    },
    errorPolicy: 'all',
  });

  const [approveAttendance] = useMutation(APPROVE_ATTENDANCE, {
    onCompleted: () => {
      refetch();
      alert('근태가 승인되었습니다.');
    },
    onError: (err) => {
      alert('승인 중 오류가 발생했습니다: ' + err.message);
    },
  });

  const [rejectAttendance] = useMutation(REJECT_ATTENDANCE, {
    onCompleted: () => {
      refetch();
      alert('근태가 거부되었습니다.');
    },
    onError: (err) => {
      alert('거부 중 오류가 발생했습니다: ' + err.message);
    },
  });

  const [requestCorrection] = useMutation(REQUEST_CORRECTION, {
    onCompleted: () => {
      refetch();
      alert('수정 요청이 완료되었습니다.');
    },
    onError: (err) => {
      alert('수정 요청 중 오류가 발생했습니다: ' + err.message);
    },
  });

  const handleApprove = async (record: AttendanceRecord) => {
    const notes = prompt('승인 메모를 입력하세요 (선택사항):');
    await approveAttendance({
      variables: {
        storeId: record.storeId,
        employeeId: record.employeeId,
        date: record.date,
        notes: notes || undefined,
      },
    });
  };

  const handleReject = async (record: AttendanceRecord) => {
    const notes = prompt('거부 사유를 입력하세요:');
    if (!notes) {
      alert('거부 사유를 입력해야 합니다.');
      return;
    }
    await rejectAttendance({
      variables: {
        storeId: record.storeId,
        employeeId: record.employeeId,
        date: record.date,
        notes,
      },
    });
  };

  const handleRequestCorrection = async (record: AttendanceRecord) => {
    const notes = prompt('수정 요청 사유를 입력하세요:');
    if (!notes) {
      alert('수정 요청 사유를 입력해야 합니다.');
      return;
    }
    await requestCorrection({
      variables: {
        storeId: record.storeId,
        employeeId: record.employeeId,
        date: record.date,
        notes,
      },
    });
  };

  if (loading) return <Loading message="승인 대기 목록을 불러오는 중..." />;
  if (error)
    return (
      <div style={{ padding: 20, color: 'red' }}>오류: {error.message}</div>
    );

  return (
    <ProtectedRoute>
      <div style={{ padding: 20 }}>
        <h1 style={{ marginBottom: 20 }}>승인 대기 목록</h1>

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
            placeholder="관리자 ID"
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #ddd',
            }}
          />
          <Button onClick={() => refetch()}>검색</Button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid #ddd',
            }}
          >
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>
                  지점 ID
                </th>
                <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>
                  직원 ID
                </th>
                <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>
                  날짜
                </th>
                <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>
                  출근 시간
                </th>
                <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>
                  퇴근 시간
                </th>
                <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>
                  근무 시간
                </th>
                <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>
                  비고
                </th>
                <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>
                  액션
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.pendingApprovals.map((record, index) => (
                <tr key={`${record.storeId}-${record.employeeId}-${record.date}-${index}`}>
                  <td style={{ padding: 12, border: '1px solid #ddd' }}>
                    {record.storeId}
                  </td>
                  <td style={{ padding: 12, border: '1px solid #ddd' }}>
                    {record.employeeId}
                  </td>
                  <td style={{ padding: 12, border: '1px solid #ddd' }}>
                    {record.date}
                  </td>
                  <td style={{ padding: 12, border: '1px solid #ddd' }}>
                    {record.checkInAt ? formatDateTime(record.checkInAt) : '-'}
                  </td>
                  <td style={{ padding: 12, border: '1px solid #ddd' }}>
                    {record.checkOutAt ? formatDateTime(record.checkOutAt) : '-'}
                  </td>
                  <td style={{ padding: 12, border: '1px solid #ddd' }}>
                    {record.workingHours ? `${record.workingHours}시간` : '-'}
                  </td>
                  <td style={{ padding: 12, border: '1px solid #ddd' }}>
                    {record.notes || '-'}
                  </td>
                  <td style={{ padding: 12, border: '1px solid #ddd' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Button
                        onClick={() => handleApprove(record)}
                        style={{ padding: '4px 8px', fontSize: 12, background: '#28a745', color: 'white' }}
                      >
                        승인
                      </Button>
                      <Button
                        onClick={() => handleReject(record)}
                        style={{ padding: '4px 8px', fontSize: 12, background: '#dc3545', color: 'white' }}
                      >
                        거부
                      </Button>
                      <Button
                        onClick={() => handleRequestCorrection(record)}
                        style={{ padding: '4px 8px', fontSize: 12 }}
                      >
                        수정요청
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data?.pendingApprovals.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
            승인 대기 중인 근태 기록이 없습니다.
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

