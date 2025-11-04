import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { ProtectedRoute } from '@shared/ui/ProtectedRoute';
import { Loading } from '@shared/ui/Loading';
import { DatePicker } from '@shared/ui/DatePicker';
import { getWeekStart } from '@shared/lib/utils/date';

const GET_WEEKLY_ATTENDANCE_REPORT = gql`
  query GetWeeklyAttendanceReport($storeId: ID, $weekStart: String!) {
    weeklyAttendanceReport(storeId: $storeId, weekStart: $weekStart) {
      weekStart
      weekEnd
      storeId
      attendanceRate
      averageWorkingHours
      totalWorkingHours
      dailyReports {
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
  }
`;

interface DailyReport {
  date: string;
  storeId: string | null;
  attendanceRate: number;
  lateCount: number;
  absentCount: number;
  employeeStats: Array<{
    employeeId: string;
    employeeName: string;
    checkInAt: string | null;
    checkOutAt: string | null;
    workingHours: number;
    status: string;
  }>;
}

interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  storeId: string | null;
  attendanceRate: number;
  averageWorkingHours: number;
  totalWorkingHours: number;
  dailyReports: DailyReport[];
}

export const WeeklyAttendanceReportPage: React.FC = () => {
  const [storeId, setStoreId] = useState('');
  const [weekStart, setWeekStart] = useState(getWeekStart());

  const { data, loading, error } = useQuery<{
    weeklyAttendanceReport: WeeklyReport;
  }>(GET_WEEKLY_ATTENDANCE_REPORT, {
    variables: {
      storeId: storeId || undefined,
      weekStart,
    },
    errorPolicy: 'all',
  });

  if (loading) return <Loading message="주별 리포트를 불러오는 중..." />;
  if (error)
    return (
      <div style={{ padding: 20, color: 'red' }}>오류: {error.message}</div>
    );

  const report = data?.weeklyAttendanceReport;

  return (
    <ProtectedRoute>
      <div style={{ padding: 20 }}>
        <h1 style={{ marginBottom: 20 }}>주별 근태 리포트</h1>

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
          <DatePicker
            value={weekStart}
            onChange={setWeekStart}
            label="주 시작일 (월요일)"
            required
          />
        </div>

        {report && (
          <>
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 14, color: '#666' }}>
                기간: {report.weekStart} ~ {report.weekEnd}
              </p>
            </div>

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
                  background: '#d1ecf1',
                }}
              >
                <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
                  평균 근무 시간
                </div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                  {report.averageWorkingHours.toFixed(1)}시간
                </div>
              </div>
              <div
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  padding: 16,
                  background: '#d4edda',
                }}
              >
                <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
                  총 근무 시간
                </div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                  {report.totalWorkingHours.toFixed(1)}시간
                </div>
              </div>
            </div>

            <h2 style={{ marginBottom: 16 }}>일별 리포트</h2>
            {report.dailyReports.map((daily) => (
              <div
                key={daily.date}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: 12 }}>
                  {daily.date}
                </h3>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                  <span style={{ fontSize: 14 }}>
                    출근률: {(daily.attendanceRate * 100).toFixed(1)}%
                  </span>
                  <span style={{ fontSize: 14, color: '#856404' }}>
                    지각: {daily.lateCount}명
                  </span>
                  <span style={{ fontSize: 14, color: '#721c24' }}>
                    결근: {daily.absentCount}명
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  총 {daily.employeeStats.length}명
                </div>
              </div>
            ))}
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

