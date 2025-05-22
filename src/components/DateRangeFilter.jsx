import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

const DateRangeFilter = ({ onDisplay, onDateChange }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const handleStartDateChange = (e) => {
    const date = e.target.value;
    setStartDate(date);
    if (endDate && new Date(date) > new Date(endDate)) {
      setError('Start date cannot be after end date');
    } else {
      setError('');
    }
  };

  const handleEndDateChange = (e) => {
    const date = e.target.value;
    if (startDate && new Date(date) < new Date(startDate)) {
      setError('End date must be after start date');
      return;
    }
    setEndDate(date);
    setError('');
  };

  const handleDisplay = () => {
    if (!startDate || !endDate) {
      setError('Please select both dates');
      return;
    }
    onDisplay({ startDate, endDate });
  };

  return (
    <div className="flex flex-wrap gap-6 items-center">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Calendar className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          className="pl-10 py-2.5 px-4 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 block rounded-md shadow-sm"
        />
      </div>
      <span className="text-gray-500 font-medium">to</span>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Calendar className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          min={startDate}
          className="pl-10 py-2.5 px-4 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 block rounded-md shadow-sm"
        />
      </div>
      {error && <span className="text-red-500 text-sm">{error}</span>}
      <button 
        onClick={handleDisplay}
        className="bg-blue-600 text-white px-8 py-2.5 rounded-md hover:bg-blue-700 font-medium"
      >
        Display
      </button>
    </div>
  );
};

export default DateRangeFilter;