import { cn } from '@/utils';
import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

/**
 * Carbon text input — default style.
 * Height: 40px (md). Bottom-border only. Field background. Inset focus ring.
 * States: enabled → focused → error (pass className with border-red-600) → disabled.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return (
    <input
      ref={ref}
      id={props.name}
      {...props}
      className={cn(
        // Layout — Carbon md height = 40px
        'w-full h-10 px-4',
        // Carbon field background
        'bg-light-background dark:bg-gray-950',
        // Typography — Carbon body-short-01
        'text-sm text-gray-900 dark:text-gray-100',
        'placeholder-gray-400 dark:placeholder-gray-600',
        // Border — Carbon default: bottom border only
        'border-0 border-b border-gray-300 dark:border-gray-700',
        // Focus — Carbon inset outline 1.5px, shifts to primary color
        'outline-solid outline-[1.5px] outline-transparent outline-offset-[-1.5px]',
        'focus:outline-primary focus:border-primary dark:focus:border-primary',
        // Shape — Carbon: zero border radius
        'rounded-none',
        // Disabled
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Transition
        'transition-colors duration-100',
        props.className,
      )}
    />
  );
});
