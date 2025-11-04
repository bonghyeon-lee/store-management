import React, { useState, useEffect } from 'react';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@app/providers/apollo';
import { AuthProvider } from '@shared/lib/auth/auth-context';
import { ErrorBoundary } from '@shared/ui/ErrorBoundary';
import { Header } from '@widgets/header/ui/Header';
import { HomePage } from '@pages/home/ui/HomePage';
import { LoginPage } from '@pages/login/ui/LoginPage';
import { EmployeeListPage } from '@pages/employees/ui/EmployeeListPage';
import { EmployeeFormPage } from '@pages/employees/ui/EmployeeFormPage';
import { EmployeeDetailPage } from '@pages/employees/ui/EmployeeDetailPage';
import { AttendanceRecordsPage } from '@pages/attendance/ui/AttendanceRecordsPage';
import { PendingApprovalsPage } from '@pages/attendance/ui/PendingApprovalsPage';
import { DailyAttendanceReportPage } from '@pages/attendance/ui/DailyAttendanceReportPage';
import { WeeklyAttendanceReportPage } from '@pages/attendance/ui/WeeklyAttendanceReportPage';

// 간단한 라우터 구현
const Router: React.FC = () => {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);

    // 링크 클릭 이벤트 가로채기
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.href.startsWith(window.location.origin)) {
        e.preventDefault();
        window.history.pushState({}, '', link.href);
        setPath(new URL(link.href).pathname);
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // 경로별 컴포넌트 렌더링
  if (path === '/login') {
    return <LoginPage />;
  }

  if (path === '/employees' || path === '/employees/') {
    return <EmployeeListPage />;
  }

  const employeeMatch = path.match(/^\/employees\/([^\/]+)$/);
  if (employeeMatch) {
    return <EmployeeDetailPage employeeId={employeeMatch[1]} />;
  }

  const employeeEditMatch = path.match(/^\/employees\/([^\/]+)\/edit$/);
  if (employeeEditMatch) {
    return <EmployeeFormPage employeeId={employeeEditMatch[1]} />;
  }

  if (path === '/employees/new') {
    return <EmployeeFormPage />;
  }

  if (path === '/attendance' || path === '/attendance/') {
    return <AttendanceRecordsPage />;
  }

  if (path === '/attendance/pending' || path === '/attendance/pending/') {
    return <PendingApprovalsPage />;
  }

  if (path === '/attendance/reports/daily' || path === '/attendance/reports/daily/') {
    return <DailyAttendanceReportPage />;
  }

  if (path === '/attendance/reports/weekly' || path === '/attendance/reports/weekly/') {
    return <WeeklyAttendanceReportPage />;
  }

  return <HomePage />;
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ApolloProvider client={apolloClient}>
        <AuthProvider>
          <Header />
          <main style={{ padding: 16 }}>
            <Router />
          </main>
        </AuthProvider>
      </ApolloProvider>
    </ErrorBoundary>
  );
};

export default App;


