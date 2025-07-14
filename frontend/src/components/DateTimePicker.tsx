import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Typography } from '@mui/material';

interface DateTimePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ value, onChange }) => {
  return (
    <div style={{ marginBottom: 16 }}>
      <Typography variant="subtitle1">Select Date & Time</Typography>
      <DatePicker
        selected={value}
        onChange={onChange}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={5}
        dateFormat="yyyy-MM-dd HH:mm"
        placeholderText="Select date and time"
        popperPlacement="bottom"
        popperClassName="dark-datepicker-popper"
        showYearDropdown
        showMonthDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={50}
        minDate={new Date(0, 0, 1)}
      />
    </div>
  );
};

export default DateTimePicker; 