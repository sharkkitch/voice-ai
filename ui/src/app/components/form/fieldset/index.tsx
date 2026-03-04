import React, { FieldsetHTMLAttributes } from 'react';
import { cn } from '@/utils';

/**
 * Carbon form field group — wraps label + input + helper/error text.
 * Uses gap-2 (8px) between elements per Carbon spacing-03 token.
 */
export function FieldSet(props: FieldsetHTMLAttributes<HTMLElement>) {
  return (
    <fieldset
      {...props}
      className={cn(
        'flex flex-col space-y-2 min-w-0 border-0 p-0 m-0',
        props.className,
      )}
    >
      {props.children}
    </fieldset>
  );
}
