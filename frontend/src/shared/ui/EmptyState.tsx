import React from 'react';

interface EmptyStateProps {
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = '데이터가 없습니다.',
  action,
}) => {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: 40,
        color: '#666',
      }}
    >
      <p style={{ marginBottom: 16 }}>{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: '1px solid #ddd',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

