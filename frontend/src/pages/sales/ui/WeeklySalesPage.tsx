import { gql, useQuery } from '@apollo/client';
import { formatCurrency } from '@shared/lib/utils/currency';
import { getWeekStart } from '@shared/lib/utils/date';
import { DatePicker } from '@shared/ui/DatePicker';
import { Loading } from '@shared/ui/Loading';
import { ProtectedRoute } from '@shared/ui/ProtectedRoute';
import React, { useState } from 'react';

const GET_WEEKLY_SALES = gql`
  query GetWeeklySales($storeId: ID, $weekStart: String!) {
    weeklySales(storeId: $storeId, weekStart: $weekStart) {
      weekStart
      weekEnd
      storeId
      totalSales
      transactionCount
      averageTransactionValue
      previousWeekSales
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

interface WeeklySales {
  weekStart: string;
  weekEnd: string;
  storeId: string | null;
  totalSales: number;
  transactionCount: number;
  averageTransactionValue: number;
  previousWeekSales: number | null;
  growthRate: number | null;
  dailySales: DailySales[];
}

export const WeeklySalesPage: React.FC = () => {
  const [storeId, setStoreId] = useState('');
  const [weekStart, setWeekStart] = useState(getWeekStart());

  const { data, loading, error } = useQuery<{
    weeklySales: WeeklySales;
  }>(GET_WEEKLY_SALES, {
    variables: {
      storeId: storeId || undefined,
      weekStart,
    },
    errorPolicy: 'all',
  });

  if (loading) return <Loading message="주별 매출 리포트를 불러오는 중..." />;
  if (error)
    return (
      <div style={{ padding: 20, color: 'red' }}>오류: {error.message}</div>
    );

  const sales = data?.weeklySales;

  return (
    <ProtectedRoute>
      <div style={{ padding: 20 }}>
        <h1 style={{ marginBottom: 20 }}>주별 매출 리포트</h1>

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

        {sales && (
          <>
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 14, color: '#666' }}>
                기간: {sales.weekStart} ~ {sales.weekEnd}
              </p>
              {sales.previousWeekSales !== null && sales.growthRate !== null && (
                <p style={{ fontSize: 14, color: sales.growthRate >= 0 ? '#28a745' : '#dc3545' }}>
                  전주 대비: {sales.growthRate >= 0 ? '+' : ''}
                  {sales.growthRate.toFixed(1)}% (
                  {formatCurrency(sales.previousWeekSales)} → {formatCurrency(sales.totalSales)})
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
            {sales.dailySales.map((daily) => (
              <div
                key={daily.date}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: 12 }}>{daily.date}</h3>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                  <span style={{ fontSize: 14 }}>
                    매출: {formatCurrency(daily.totalSales)}
                  </span>
                  <span style={{ fontSize: 14 }}>
                    거래: {daily.transactionCount.toLocaleString()}건
                  </span>
                  <span style={{ fontSize: 14 }}>
                    평균: {formatCurrency(daily.averageTransactionValue)}
                  </span>
                </div>
                {daily.channelBreakdown.length > 0 && (
                  <div style={{ fontSize: 12, color: '#666' }}>
                    채널:{' '}
                    {daily.channelBreakdown
                      .map((ch) => `${ch.channel} (${formatCurrency(ch.totalSales)})`)
                      .join(', ')}
                  </div>
                )}
              </div>
            ))}
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

