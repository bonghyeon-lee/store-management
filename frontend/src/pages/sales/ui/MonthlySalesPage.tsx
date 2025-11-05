import { gql, useQuery } from '@apollo/client';
import { formatCurrency } from '@shared/lib/utils/currency';
import { DatePicker } from '@shared/ui/DatePicker';
import { Loading } from '@shared/ui/Loading';
import { ProtectedRoute } from '@shared/ui/ProtectedRoute';
import React, { useState } from 'react';

const GET_MONTHLY_SALES = gql`
  query GetMonthlySales($storeId: ID, $year: Float!, $month: Float!) {
    monthlySales(storeId: $storeId, year: $year, month: $month) {
      year
      month
      storeId
      totalSales
      transactionCount
      averageTransactionValue
      previousMonthSales
      growthRate
      dailySales {
        date
        storeId
        totalSales
        transactionCount
        averageTransactionValue
        channelBreakdown {
          channel
          totalSales
          transactionCount
        }
      }
    }
  }
`;

interface ChannelSales {
  channel: string;
  totalSales: number;
  transactionCount: number;
}

interface DailySales {
  date: string;
  storeId: string | null;
  totalSales: number;
  transactionCount: number;
  averageTransactionValue: number;
  channelBreakdown: ChannelSales[];
}

interface MonthlySales {
  year: number;
  month: number;
  storeId: string | null;
  totalSales: number;
  transactionCount: number;
  averageTransactionValue: number;
  previousMonthSales: number | null;
  growthRate: number | null;
  dailySales: DailySales[];
}

export const MonthlySalesPage: React.FC = () => {
  const today = new Date();
  const [storeId, setStoreId] = useState('');
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const { data, loading, error } = useQuery<{
    monthlySales: MonthlySales;
  }>(GET_MONTHLY_SALES, {
    variables: {
      storeId: storeId || undefined,
      year,
      month,
    },
    errorPolicy: 'all',
  });

  const handleDateChange = (dateStr: string) => {
    const date = new Date(dateStr);
    setYear(date.getFullYear());
    setMonth(date.getMonth() + 1);
  };

  const getDateString = () => {
    return `${year}-${String(month).padStart(2, '0')}-01`;
  };

  if (loading) return <Loading message="월별 매출 리포트를 불러오는 중..." />;
  if (error) return <div style={{ padding: 20, color: 'red' }}>오류: {error.message}</div>;

  const sales = data?.monthlySales;

  return (
    <ProtectedRoute>
      <div style={{ padding: 20 }}>
        <h1 style={{ marginBottom: 20 }}>월별 매출 리포트</h1>

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
          <DatePicker value={getDateString()} onChange={handleDateChange} label="년/월" required />
        </div>

        {sales && (
          <>
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 14, color: '#666' }}>
                {sales.year}년 {sales.month}월
              </p>
              {sales.previousMonthSales !== null && sales.growthRate !== null && (
                <p style={{ fontSize: 14, color: sales.growthRate >= 0 ? '#28a745' : '#dc3545' }}>
                  전월 대비: {sales.growthRate >= 0 ? '+' : ''}
                  {sales.growthRate.toFixed(1)}% ({formatCurrency(sales.previousMonthSales)} →{' '}
                  {formatCurrency(sales.totalSales)})
                </p>
              )}
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
                  background: '#d4edda',
                }}
              >
                <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>총 매출</div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                  {formatCurrency(sales.totalSales)}
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
                <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>거래 건수</div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                  {sales.transactionCount.toLocaleString()}건
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
                <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>평균 거래액</div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                  {formatCurrency(sales.averageTransactionValue)}
                </div>
              </div>
            </div>

            <h2 style={{ marginBottom: 16 }}>일별 상세</h2>
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
                      날짜
                    </th>
                    <th style={{ padding: 12, textAlign: 'right', border: '1px solid #ddd' }}>
                      매출
                    </th>
                    <th style={{ padding: 12, textAlign: 'right', border: '1px solid #ddd' }}>
                      거래 건수
                    </th>
                    <th style={{ padding: 12, textAlign: 'right', border: '1px solid #ddd' }}>
                      평균 거래액
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sales.dailySales.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: 20, textAlign: 'center', color: '#666' }}>
                        일별 데이터가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    sales.dailySales.map((daily) => (
                      <tr key={daily.date}>
                        <td style={{ padding: 12, border: '1px solid #ddd' }}>{daily.date}</td>
                        <td style={{ padding: 12, textAlign: 'right', border: '1px solid #ddd' }}>
                          {formatCurrency(daily.totalSales)}
                        </td>
                        <td style={{ padding: 12, textAlign: 'right', border: '1px solid #ddd' }}>
                          {daily.transactionCount.toLocaleString()}건
                        </td>
                        <td style={{ padding: 12, textAlign: 'right', border: '1px solid #ddd' }}>
                          {formatCurrency(daily.averageTransactionValue)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!sales && (
          <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
            매출 데이터가 없습니다.
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};
