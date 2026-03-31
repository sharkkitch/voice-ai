import type { FC } from 'react';
import { DatePicker as CarbonDatePicker, DatePickerInput } from '@carbon/react';
import { cn } from '@/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

type DatePickerSize = 'sm' | 'md' | 'lg';

export interface CarbonDateRangePickerProps {
  className?: string;
  size?: DatePickerSize;
  defaultFrom?: Date;
  defaultTo?: Date;
  onDateSelect?: (to: Date, from: Date) => void;
  dateFormat?: string;
  placeholderFrom?: string;
  placeholderTo?: string;
  light?: boolean;
}

export interface CarbonSingleDatePickerProps {
  className?: string;
  size?: DatePickerSize;
  defaultDate?: Date;
  onChange?: (date: Date) => void;
  dateFormat?: string;
  placeholder?: string;
  labelText?: string;
  light?: boolean;
}

// ─── Range Date Picker ──────────────────────────────────────────────────────

/** Carbon DatePicker (range) — two-input date range selector with calendar. */
export const DateRangePicker: FC<CarbonDateRangePickerProps> = ({
  className,
  size = 'md',
  defaultFrom,
  defaultTo,
  onDateSelect,
  dateFormat = 'm/d/Y',
  placeholderFrom = 'Start date',
  placeholderTo = 'End date',
  light = false,
}) => {
  const defaults: Date[] = [];
  if (defaultFrom) defaults.push(defaultFrom);
  if (defaultTo) defaults.push(defaultTo);

  return (
    <CarbonDatePicker
      datePickerType="range"
      dateFormat={dateFormat}
      value={defaults.length > 0 ? defaults : undefined}
      onChange={(dates: Date[]) => {
        if (onDateSelect && dates.length === 2) {
          onDateSelect(dates[1], dates[0]);
        }
      }}
      className={cn(className)}
      light={light}
    >
      <DatePickerInput
        id="carbon-date-range-from"
        placeholder={placeholderFrom}
        labelText=""
        size={size}
      />
      <DatePickerInput
        id="carbon-date-range-to"
        placeholder={placeholderTo}
        labelText=""
        size={size}
      />
    </CarbonDatePicker>
  );
};

// ─── Single Date Picker ─────────────────────────────────────────────────────

/** Carbon DatePicker (single) — single-input date selector with calendar. */
export const SingleDatePicker: FC<CarbonSingleDatePickerProps> = ({
  className,
  size = 'md',
  defaultDate,
  onChange,
  dateFormat = 'm/d/Y',
  placeholder = 'Select date',
  labelText = '',
  light = false,
}) => {
  return (
    <CarbonDatePicker
      datePickerType="single"
      dateFormat={dateFormat}
      value={defaultDate ? [defaultDate] : undefined}
      onChange={(dates: Date[]) => {
        if (onChange && dates.length > 0) {
          onChange(dates[0]);
        }
      }}
      className={cn(className)}
      light={light}
    >
      <DatePickerInput
        id="carbon-date-single"
        placeholder={placeholder}
        labelText={labelText}
        size={size}
      />
    </CarbonDatePicker>
  );
};
