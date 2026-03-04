import React, { FC, HTMLAttributes } from 'react';
import { cn } from '@/utils';

export const PageTitleBlock: FC<HTMLAttributes<HTMLDivElement>> = props => {
  return (
    <div className={cn('text-base text-gray-900 dark:text-gray-100', props.className)}>
      {props.children}
    </div>
  );
};
