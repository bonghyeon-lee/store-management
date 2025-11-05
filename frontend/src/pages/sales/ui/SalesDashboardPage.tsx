import { gql, useQuery } from '@apollo/client';
import { formatCurrency } from '@shared/lib/utils/currency';
import { getToday, isValidDateRange } from '@shared/lib/utils/date';
import { DateRangePicker } from '@shared/ui/DateRangePicker';
import { Loading } from '@shared/ui/Loading';
import { ProtectedRoute } from '@shared/ui/ProtectedRoute';
import React, { useState } from 'react';

const GET_SALES_DASHBOARD = gql`
  query GetSalesDashboard($storeId: ID, $startDate: String!, $endDate: String!) {
    salesDashboard(storeId: $storeId, startDate: $startDate, endDate: $endDate) {
      period
      totalSales
      totalTransactions
      averageTransactionValue
      storeSummary {
        storeId
        totalSales
        transactionCount
        averageTransactionValue
      }
      topStores {
        storeId
        totalSales
        transactionCount
        averageTransactionValue
      }
      bottomStores {
        storeId
        totalSales
        transactionCount
        averageTransactionValue
      }
      channelDistribution {
        channel
        totalSales
        transactionCount
      }
      trend {
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

interface StoreSalesSummary {
  storeId: string;
  totalSales: number;
  transactionCount: number;
  averageTransactionValue: number;
}

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

interface SalesDashboard {
  period: string;
  totalSales: number;
  totalTransactions: number;
  averageTransactionValue: number;
  storeSummary: StoreSalesSummary[];
  topStores: StoreSalesSummary[];
  bottomStores: StoreSalesSummary[];
  channelDistribution: ChannelSales[];
  trend: DailySales[];
}

export const SalesDashboardPage: React.FC = () => {
  const today = getToday();
  const [storeId, setStoreId] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const { data, loading, error, refetch } = useQuery<{
    salesDashboard: SalesDashboard;
  }>(GET_SALES_DASHBOARD, {
    variables: {
      storeId: storeId || undefined,
      startDate,
      endDate,
    },
    errorPolicy: 'all',
  });

  const handleDateChange = () => {
    if (isValidDateRange(startDate, endDate)) {
      refetch();
    } else {
      alert('시작일이 종료일보다 늦을 수 없습니다.');
    }
  };

  if (loading) return <Loading message="매출 대시보드를 불러오는 중..." />;
  if (error)
    return (
      <div style={{ padding: 20, color: 'red' }}>오류: {error.message}</div>
    );

  const dashboard = data?.salesDashboard;

  return (
    <ProtectedRoute>
      <div style={{ padding: 20 }}>
        <h1 style={{ marginBottom: 20 }}>매출 대시보드</h1>

        <div style={{ marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
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
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
          <button
            onClick={handleDateChange}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: '1px solid #ddd',
              background: '#007bff',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            조회
          </button>
        </div>

        {dashboard && (
          <>
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 14, color: '#666' }}>기간: {dashboard.period}</p>
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
                  {formatCurrency(dashboard.totalSales)}
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
                <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>총 거래 건수</div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                  {dashboard.totalTransactions.toLocaleString()}건
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
                  {formatCurrency(dashboard.averageTransactionValue)}
                </div>
              </div>
            </div>

            {dashboard.topStores.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ marginBottom: 16 }}>상위 성과 지점</h2>
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
                      {dashboard.topStores.map((store) => (
                        <tr key={store.storeId}>
                          <td style={{ padding: 12, border: '1px solid #ddd' }}>
                            {store.storeId}
                          </td>
                          <td style={{ padding: 12, textAlign: 'right', border: '1px solid #ddd' }}>
                            {formatCurrency(store.totalSales)}
                          </td>
                          <td style={{ padding: 12, textAlign: 'right', border: '1px solid #ddd' }}>
                            {store.transactionCount.toLocaleString()}건
                          </td>
                          <td style={{ padding: 12, textAlign: 'right', border: '1px solid #ddd' }}>
                            {formatCurrency(store.averageTransactionValue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {dashboard.channelDistribution.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ marginBottom: 16 }}>채널별 매출 분포</h2>
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
                      {dashboard.channelDistribution.map((channel) => (
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {dashboard.trend.length > 0 && (
              <div>
                <h2 style={{ marginBottom: 16 }}>기간별 트렌드</h2>
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
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.trend.map((daily) => (
                        <tr key={daily.date}>
                          <td style={{ padding: 12, border: '1px solid #ddd' }}>{daily.date}</td>
                          <td style={{ padding: 12, textAlign: 'right', border: '1px solid #ddd' }}>
                            {formatCurrency(daily.totalSales)}
                          </td>
                          <td style={{ padding: 12, textAlign: 'right', border: '1px solid #ddd' }}>
                            {daily.transactionCount.toLocaleString()}건
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {!dashboard && (
          <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
            대시보드 데이터가 없습니다.
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

