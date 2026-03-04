import { cn } from '@/utils';
import { FC, HTMLAttributes } from 'react';

export const ModalBody: FC<HTMLAttributes<HTMLDivElement>> = props => {
  return (
    <div
      {...props}
      className={cn(
        'flex flex-col gap-6 shrink',
        'relative px-4 py-5',
        props.className,
      )}
    >
      {props.children}
    </div>
  );
};
