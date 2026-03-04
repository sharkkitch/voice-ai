import { FC } from 'react';
import { cn } from '@/utils';

/**
 * Renders four corner accent brackets that appear on hover (IBM Carbon clickable-tile pattern).
 * Place inside a `relative group` container.
 *
 * @param className - Optional override for opacity/transition classes.
 *   Pass `'opacity-100'` to keep the brackets always visible (e.g. for a selected state).
 */
export const CornerBorderOverlay: FC<{ className?: string }> = ({
  className,
}) => (
  <span
    className={cn(
      'pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10',
      className,
    )}
  >
    <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
    <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
    <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
    <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
  </span>
);
