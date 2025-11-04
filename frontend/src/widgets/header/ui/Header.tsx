import React from 'react';

export const Header: React.FC = () => {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid #eee'
      }}
    >
      <strong>Store Management</strong>
      <nav>
        <a href="#" style={{ color: '#333', textDecoration: 'none' }}>
          홈
        </a>
      </nav>
    </header>
  );
};


