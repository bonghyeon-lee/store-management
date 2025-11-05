import { gql, useQuery } from '@apollo/client';
import { formatCurrency } from '@shared/lib/utils/currency';
import { getToday } from '@shared/lib/utils/date';
import { DatePicker } from '@shared/ui/DatePicker';
import { Loading } from '@shared/ui/Loading';
import { ProtectedRoute } from '@shared/ui/ProtectedRoute';
import React, { useState } from 'react';

const GET_DAILY_SALES = gql`
  query GetDailySales($storeId: ID, $date: String!) {
    dailySales(storeId: $storeId, date: $date) {
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

export const DailySalesPage: React.FC = () => {
  const [storeId, setStoreId] = useState('');
  const [date, setDate] = useState(getToday());

  const { data, loading, error } = useQuery<{
    dailySales: DailySales;
  }>(GET_DAILY_SALES, {
    variables: {
      storeId: storeId || undefined,
      date,
    },
    errorPolicy: 'all',
  });

  if (loading) return <Loading message="일별 매출 리포트를 불러오는 중..." />;
  if (error)
    return (
      <div style={{ padding: 20, color: 'red' }}>오류: {error.message}</div>
    );

  const sales = data?.dailySales;

  return (
    <ProtectedRoute>
      <div style={{ padding: 20 }}>
        <h1 style={{ marginBottom: 20 }}>일별 매출 리포트</h1>

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

        {sales && (
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

            <h2 style={{ marginBottom: 16 }}>채널별 매출</h2>
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
                      채널
                    </th>
                    <th style={{ padding: 12, textAlign: 'right', border: '1px solid #ddd' }}>
                      매출
                    </th>
                    <th style={{ padding: 12, textAlign: 'right', border: '1px solid #ddd' }}>
                      거래 건수
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sales.channelBreakdown.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        style={{ padding: 20, textAlign: 'center', color: '#666' }}
                      >
                        채널별 데이터가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    sales.channelBreakdown.map((channel) => (
                      <tr key={channel.channel}>
                        <td style={{ padding: 12, border: '1px solid #ddd' }}>
                          {channel.channel}
                        </td>
                        <td style={{ padding: 12, textAlign: 'right', border: '1px solid #ddd' }}>
                          {formatCurrency(channel.totalSales)}
                        </td>
                        <td style={{ padding: 12, textAlign: 'right', border: '1px solid #ddd' }}>
                          {channel.transactionCount.toLocaleString()}건
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

