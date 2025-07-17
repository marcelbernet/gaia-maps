import React from "react";
import Datepicker from "react-tailwindcss-datepicker";

interface DateTimePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ value, onChange }) => {
  // react-tailwindcss-datepicker expects a value object with startDate and endDate
  const pickerValue = value
    ? { startDate: value, endDate: value }
    : { startDate: null, endDate: null };

  const handleChange = (val: any) => {
    // val.startDate is a string or null
    if (val && val.startDate) {
      onChange(new Date(val.startDate));
    } else {
      onChange(null);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="text-base font-semibold text-gray-100 mb-2 text-center">Select Date & Time</div>
      <Datepicker
        value={pickerValue}
        onChange={handleChange}
        asSingle={true}
        useRange={false}
        showShortcuts={false}
        showFooter={true}
        showTime={true}
        displayFormat={"YYYY-MM-DD HH:mm"}
        inputClassName="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 text-gray-900"
        popoverDirection="down"
      />
    </div>
  );
};

export default DateTimePicker; 