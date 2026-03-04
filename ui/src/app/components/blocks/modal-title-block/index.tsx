import React, { FC, HTMLAttributes } from 'react';
import { cn } from '@/utils';

export const ModalTitleBlock: FC<HTMLAttributes<HTMLDivElement>> = props => {
  return (
    <div className={cn('text-xl font-normal text-gray-900 dark:text-gray-100 leading-7', props.className)}>
      {props.children}
    </div>
  );
};
