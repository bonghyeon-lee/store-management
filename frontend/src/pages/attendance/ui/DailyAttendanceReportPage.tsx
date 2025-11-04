import { gql,useQuery  } from '@apollo/client';
import { formatDateTime , getToday } from '@shared/lib/utils/date';
import { DatePicker } from '@shared/ui/DatePicker';
import { Loading } from '@shared/ui/Loading';
import { ProtectedRoute } from '@shared/ui/ProtectedRoute';
import React, { useState } from 'react';

const GET_DAILY_ATTENDANCE_REPORT = gql`
  query GetDailyAttendanceReport($storeId: ID, $date: String!) {
    dailyAttendanceReport(storeId: $storeId, date: $date) {
      date
      storeId
      attendanceRate
      lateCount
      absentCount
      employeeStats {
        employeeId
        employeeName
        checkInAt
        checkOutAt
        workingHours
        status
      }
    }
  }
`;

interface EmployeeStats {
  employeeId: string;
  employeeName: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  workingHours: number;
  status: string;
}

interface DailyReport {
  date: string;
  storeId: string | null;
  attendanceRate: number;
  lateCount: number;
  absentCount: number;
  employeeStats: EmployeeStats[];
}

export const DailyAttendanceReportPage: React.FC = () => {
  const [storeId, setStoreId] = useState('');
  const [date, setDate] = useState(getToday());

  const { data, loading, error } = useQuery<{
    dailyAttendanceReport: DailyReport;
  }>(GET_DAILY_ATTENDANCE_REPORT, {
    variables: {
      storeId: storeId || undefined,
      date,
    },
    errorPolicy: 'all',
  });

  if (loading) return <Loading message="일별 리포트를 불러오는 중..." />;
  if (error)
    return (
      <div style={{ padding: 20, color: 'red' }}>오류: {error.message}</div>
    );

  const report = data?.dailyAttendanceReport;

  return (
    <ProtectedRoute>
      <div style={{ padding: 20 }}>
        <h1 style={{ marginBottom: 20 }}>일별 근태 리포트</h1>

        <div style={{ marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <input
            type="text"
            placeholder="지점 ID (선택사항)"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #ddd',
            }}
          />
          <DatePicker value={date} onChange={setDate} label="날짜" required />
        </div>

        {report && (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  padding: 16,
                  background: '#f8f9fa',
                }}
              >
                <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
                  출근률
                </div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                  {(report.attendanceRate * 100).toFixed(1)}%
                </div>
              </div>
              <div
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  padding: 16,
                  background: '#fff3cd',
                }}
              >
                <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
                  지각 수
                </div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                  {report.lateCount}명
                </div>
              </div>
              <div
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  padding: 16,
                  background: '#f8d7da',
                }}
              >
                <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
                  결근 수
                </div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                  {report.absentCount}명
                </div>
              </div>
              <div
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  padding: 16,
                  background: '#d1ecf1',
                }}
              >
                <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
                  총 직원 수
                </div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                  {report.employeeStats.length}명
                </div>
              </div>
            </div>

            <h2 style={{ marginBottom: 16 }}>직원별 통계</h2>
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
                      직원 ID
                    </th>
                    <th style={{ padding: 12, textAlign: 'left', border: '1px solid #ddd' }}>
                      이름
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
                  </tr>
                </thead>
                <tbody>
                  {report.employeeStats.map((stat) => (
                    <tr key={stat.employeeId}>
                      <td style={{ padding: 12, border: '1px solid #ddd' }}>
                        {stat.employeeId}
                      </td>
                      <td style={{ padding: 12, border: '1px solid #ddd' }}>
                        {stat.employeeName}
                      </td>
                      <td style={{ padding: 12, border: '1px solid #ddd' }}>
                        {stat.checkInAt ? formatDateTime(stat.checkInAt) : '-'}
                      </td>
                      <td style={{ padding: 12, border: '1px solid #ddd' }}>
                        {stat.checkOutAt ? formatDateTime(stat.checkOutAt) : '-'}
                      </td>
                      <td style={{ padding: 12, border: '1px solid #ddd' }}>
                        {stat.workingHours}시간
                      </td>
                      <td style={{ padding: 12, border: '1px solid #ddd' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: 4,
                            background:
                              stat.status === 'APPROVED'
                                ? '#d4edda'
                                : stat.status === 'REJECTED'
                                  ? '#f8d7da'
                                  : '#fff3cd',
                            color:
                              stat.status === 'APPROVED'
                                ? '#155724'
                                : stat.status === 'REJECTED'
                                  ? '#721c24'
                                  : '#856404',
                          }}
                        >
                          {stat.status === 'APPROVED'
                            ? '승인'
                            : stat.status === 'REJECTED'
                              ? '거부'
                              : '대기'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!report && (
          <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
            리포트 데이터가 없습니다.
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

