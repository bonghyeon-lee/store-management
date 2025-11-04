import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: React.FC<Props> = ({ children, ...rest }) => {
  return (
    <button
      {...rest}
      style={{
        padding: '8px 12px',
        borderRadius: 6,
        border: '1px solid #ddd',
        background: '#fff',
        cursor: 'pointer'
      }}
    >
      {children}
    </button>
  );
};


