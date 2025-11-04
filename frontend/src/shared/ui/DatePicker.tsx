import React from 'react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  min?: string;
  max?: string;
  label?: string;
  required?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  min,
  max,
  label,
  required,
}) => {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ display: 'block', marginBottom: 8 }}>
          {label}
          {required && <span style={{ color: 'red' }}> *</span>}
        </label>
      )}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        required={required}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: 6,
          border: '1px solid #ddd',
        }}
      />
    </div>
  );
};

