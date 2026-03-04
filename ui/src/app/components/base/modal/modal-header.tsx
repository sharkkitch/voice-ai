import { cn } from '@/utils';
import { X } from 'lucide-react';
import { FC, HTMLAttributes } from 'react';

export const ModalHeader: FC<
  HTMLAttributes<HTMLDivElement> & {
    onClose: () => void;
  }
> = props => {
  const { onClose, className, children, ...rest } = props;
  return (
    <div
      className={cn(
        'relative flex items-center h-16 pl-4 pr-12 border-b border-gray-200 dark:border-gray-800 shrink-0',
        className,
      )}
      {...rest}
    >
      {children}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-0 top-0 h-16 w-12 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
