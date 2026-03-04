import React, { HTMLAttributes } from 'react';
import { cn } from '@/utils';
import { useSidebar } from '@/context/sidebar-context';

export function SidebarLabel(props: HTMLAttributes<HTMLSpanElement>) {
  const { open } = useSidebar();
  return (
    <span
      className={cn(
        // Carbon body-short-01 — 14px, single line
        'text-sm truncate flex-1 transition-all duration-200',
        'text-gray-700 dark:text-gray-300',
        open ? 'opacity-100' : 'opacity-0 w-0',
        props.className,
      )}
      {...props}
    >
      {props.children}
    </span>
  );
}
