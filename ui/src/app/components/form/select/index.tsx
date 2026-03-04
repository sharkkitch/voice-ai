import { cn } from '@/utils';
import { ChevronDown } from 'lucide-react';
import { forwardRef } from 'react';

export type SelectionOption = {
  name: string;
  value: string | number;
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  autocomplete?: string;
  placeholder?: string;
  options: SelectionOption[];
}

/**
 * Carbon select — default style.
 * Same visual treatment as Input: bottom border, field background, inset focus.
 * Custom ChevronDown icon replaces the native browser arrow.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>((props, ref) => {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        id={props.name}
        name={props.name}
        {...props}
        className={cn(
          // Layout — Carbon md height = 40px, right padding for chevron
          'block w-full h-10 pl-4 pr-10 appearance-none',
          // Carbon field background
          'bg-light-background dark:bg-gray-950',
          // Typography — Carbon body-short-01
          'text-sm text-gray-900 dark:text-gray-100',
          // Disabled placeholder
          'disabled:text-gray-400 dark:disabled:text-gray-600',
          // Border — bottom only
          'border-0 border-b border-gray-300 dark:border-gray-700',
          // Focus — inset outline
          'outline-solid outline-[1.5px] outline-transparent outline-offset-[-1.5px]',
          'focus:outline-primary focus:border-primary dark:focus:border-primary',
          // Shape
          'rounded-none cursor-pointer',
          // Disabled
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors duration-100',
          props.className,
        )}
      >
        {props.placeholder && (
          <option value="" disabled>
            {props.placeholder}
          </option>
        )}
        {props.options.map((e, idx) => (
          <option value={e.value} key={idx}>
            {e.name}
          </option>
        ))}
      </select>

      {/* Carbon chevron — 16px, non-interactive, right-aligned */}
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400"
        strokeWidth={1.5}
      />
    </div>
  );
});
