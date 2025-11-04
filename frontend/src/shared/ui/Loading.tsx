import React from 'react';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({ size = 'medium', message }) => {
  const sizeMap = {
    small: 20,
    medium: 40,
    large: 60,
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: sizeMap[size],
          height: sizeMap[size],
          border: `3px solid #f3f3f3`,
          borderTop: `3px solid #3498db`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      {message && <p style={{ marginTop: 12, color: '#666' }}>{message}</p>}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

