import { useAuth } from '@shared/lib/auth/auth-context';
import { Button } from '@shared/ui/Button';
import React from 'react';

export const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid #eee',
      }}
    >
      <strong>Store Management</strong>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <a href="/" style={{ color: '#333', textDecoration: 'none' }}>
          홈
        </a>
        {isAuthenticated && user && (
          <>
            <span style={{ fontSize: 14, color: '#666' }}>
              {user.role} ({user.userId})
            </span>
            <Button onClick={handleLogout} style={{ padding: '4px 8px', fontSize: 14 }}>
              로그아웃
            </Button>
          </>
        )}
        {!isAuthenticated && (
          <a href="/login" style={{ color: '#333', textDecoration: 'none' }}>
            로그인
          </a>
        )}
      </nav>
    </header>
  );
};


