'use client';

import { useEffect, useRef, useState } from 'react';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange, DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

type DatePickerProps = {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
};

export function DateRangePicker({ date, setDate }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);
    if (range?.from && range?.to && range.from.getTime() !== range.to.getTime()) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Input Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm font-normal shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-black focus:outline-none"
      >
        <CalendarIcon className="h-4 w-4 opacity-50" />
        {date?.from ? (
          date.to ? (
            <>
              {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
            </>
          ) : (
            format(date.from, 'LLL dd, y')
          )
        ) : (
          <span className="text-gray-500">Pick a date range</span>
        )}
      </button>

      {/* Calendar Popup */}
      {isOpen && (
        <div className="absolute top-12 left-1/2 z-10 -translate-x-1/2 rounded-md border bg-white p-4 shadow-lg">
          <DayPicker
            mode="range"
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            defaultMonth={new Date()}
          />
        </div>
      )}
    </div>
  );
}
