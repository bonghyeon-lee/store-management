import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { ProtectedRoute } from '@shared/ui/ProtectedRoute';
import { Loading } from '@shared/ui/Loading';
import { Button } from '@shared/ui/Button';
import { DateRangePicker } from '@shared/ui/DateRangePicker';
import { formatDateTime } from '@shared/lib/utils/date';
import { getToday } from '@shared/lib/utils/date';

const GET_ATTENDANCE_RECORDS = gql`
  query GetAttendanceRecords(
    $storeId: ID
    $employeeId: ID
    $startDate: String!
    $endDate: String!
    $status: AttendanceStatus
  ) {
    attendanceRecords(
      storeId: $storeId
      employeeId: $employeeId
      startDate: $startDate
      endDate: $endDate
      status: $status
    ) {
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

const CHECK_IN = gql`
  mutation CheckIn($input: CheckInInput!) {
    checkIn(input: $input) {
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

const CHECK_OUT = gql`
  mutation CheckOut($input: CheckOutInput!) {
    checkOut(input: $input) {
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

export const AttendanceRecordsPage: React.FC = () => {
  const today = getToday();
  const [storeId, setStoreId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [status, setStatus] = useState<string>('');

  const { data, loading, error, refetch } = useQuery<{
    attendanceRecords: AttendanceRecord[];
  }>(GET_ATTENDANCE_RECORDS, {
    variables: {
      storeId: storeId || undefined,
      employeeId: employeeId || undefined,
      startDate,
      endDate,
      status: status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status) ? status : undefined,
    },
    errorPolicy: 'all',
  });

  const [checkIn] = useMutation(CHECK_IN, {
    onCompleted: () => {
      refetch();
      alert('출근 기록이 완료되었습니다.');
    },
    onError: (err) => {
      alert('출근 기록 중 오류가 발생했습니다: ' + err.message);
    },
  });

  const [checkOut] = useMutation(CHECK_OUT, {
    onCompleted: () => {
      refetch();
      alert('퇴근 기록이 완료되었습니다.');
    },
    onError: (err) => {
      alert('퇴근 기록 중 오류가 발생했습니다: ' + err.message);
    },
  });

  const handleCheckIn = async () => {
    const storeIdInput = prompt('지점 ID를 입력하세요:');
    const employeeIdInput = prompt('직원 ID를 입력하세요:');
    if (!storeIdInput || !employeeIdInput) return;

    const now = new Date().toISOString();
    await checkIn({
      variables: {
        input: {
          storeId: storeIdInput,
          employeeId: employeeIdInput,
          date: today,
          checkInAt: now,
        },
      },
    });
  };

  const handleCheckOut = async () => {
    const storeIdInput = prompt('지점 ID를 입력하세요:');
    const employeeIdInput = prompt('직원 ID를 입력하세요:');
    if (!storeIdInput || !employeeIdInput) return;

    const now = new Date().toISOString();
    await checkOut({
      variables: {
        input: {
          storeId: storeIdInput,
          employeeId: employeeIdInput,
          date: today,
          checkOutAt: now,
        },
      },
    });
  };

  if (loading) return <Loading message="출퇴근 기록을 불러오는 중..." />;
  if (error)
    return (
      <div style={{ padding: 20, color: 'red' }}>오류: {error.message}</div>
    );

  return (
    <ProtectedRoute>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1>출퇴근 기록</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={handleCheckIn}>출근하기</Button>
            <Button onClick={handleCheckOut}>퇴근하기</Button>
          </div>
        </div>

        <div style={{ marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
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
            placeholder="직원 ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #ddd',
            }}
          />
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
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
            <option value="PENDING">대기</option>
            <option value="APPROVED">승인</option>
            <option value="REJECTED">거부</option>
          </select>
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
                  상태
                </th>
                <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>
                  비고
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.attendanceRecords.map((record, index) => (
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
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        background:
                          record.status === 'APPROVED'
                            ? '#d4edda'
                            : record.status === 'REJECTED'
                              ? '#f8d7da'
                              : '#fff3cd',
                        color:
                          record.status === 'APPROVED'
                            ? '#155724'
                            : record.status === 'REJECTED'
                              ? '#721c24'
                              : '#856404',
                      }}
                    >
                      {record.status === 'APPROVED'
                        ? '승인'
                        : record.status === 'REJECTED'
                          ? '거부'
                          : '대기'}
                    </span>
                  </td>
                  <td style={{ padding: 12, border: '1px solid #ddd' }}>
                    {record.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data?.attendanceRecords.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
            출퇴근 기록이 없습니다.
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

