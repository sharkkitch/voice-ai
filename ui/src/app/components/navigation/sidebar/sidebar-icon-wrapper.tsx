import React, { HTMLAttributes } from 'react';
import { cn } from '@/utils';

export function SidebarIconWrapper(props: HTMLAttributes<HTMLDivElement>) {
  return (
    // Carbon: icon cell is exactly w-12 (48px) — same as the collapsed sidebar width
    // [&_svg] overrides individual icon size classes to Carbon's 16px icon grid
    <div
      className={cn(
        'flex-shrink-0 flex items-center justify-center w-12 h-8',
        '[&_svg]:w-4 [&_svg]:h-4',
        props.className,
      )}
      {...props}
    >
      {props.children}
    </div>
  );
}
