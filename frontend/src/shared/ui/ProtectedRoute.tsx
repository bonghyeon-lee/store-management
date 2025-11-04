import React from 'react';
import { useAuth } from '@shared/lib/auth/auth-context';
import { Loading } from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

/**
 * 인증이 필요한 라우트를 보호하는 컴포넌트
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <Loading message="로딩 중..." />;
  }

  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  if (requiredRole && user && !requiredRole.includes(user.role)) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>권한이 없습니다</h2>
        <p style={{ color: '#666', marginTop: 8 }}>
          이 페이지에 접근할 권한이 없습니다.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

