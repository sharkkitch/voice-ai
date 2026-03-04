import { CustomLink } from '@/app/components/custom-link';
import React, { HTMLAttributes } from 'react';
import { cn } from '@/utils';

interface SidebarLinkItemProps extends HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  redirect?: boolean;
  navigate: string;
}

export function SidebarSimpleListItem(props: SidebarLinkItemProps) {
  const { active, redirect, navigate, ...dProps } = props;
  return (
    <CustomLink to={navigate} isExternal={redirect}>
      <div
        {...dProps}
        className={cn(
          // Carbon UI Shell nav item: h-10, full-width, no horizontal margin
          'relative flex items-center h-10 w-full cursor-pointer',
          // Default state
          'text-gray-700 dark:text-gray-300',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          // Active state — 4px left accent bar + highlighted background
          active && [
            'bg-gray-100 dark:bg-gray-800 text-primary',
            'before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-primary before:content-[""]',
          ],
          props.className,
        )}
      >
        {props.children}
      </div>
    </CustomLink>
  );
}
