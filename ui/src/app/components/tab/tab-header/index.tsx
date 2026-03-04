import { cn } from '@/utils';
import { HTMLAttributes } from 'react';

export function TabHeader(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'border-b border-gray-200 dark:border-gray-800',
        props.className,
      )}
    >
      {props.children}
    </div>
  );
}
