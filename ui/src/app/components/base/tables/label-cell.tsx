import React, { HTMLAttributes } from 'react';
import { cn } from '@/utils';
import { TableCell } from '@/app/components/base/tables/table-cell';

/**
 *
 * @param props
 * @returns
 */
export function LabelCell(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <TableCell>
      <span
        className={cn(
          'text-center max-w-[20rem] truncate px-1.5 py-0.5 text-xs font-medium',
          props.className,
        )}
      >
        {props.children}
      </span>
    </TableCell>
  );
}
