import React from 'react';

import { DatePicker } from './DatePicker';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  label?: string;
  required?: boolean;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  label,
  required,
}) => {
  return (
    <div>
      {label && (
        <label style={{ display: 'block', marginBottom: 8 }}>
          {label}
          {required && <span style={{ color: 'red' }}> *</span>}
        </label>
      )}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <DatePicker
          value={startDate}
          onChange={onStartDateChange}
          max={endDate}
          required={required}
        />
        <span>~</span>
        <DatePicker
          value={endDate}
          onChange={onEndDateChange}
          min={startDate}
          required={required}
        />
      </div>
    </div>
  );
};

