import { RedNoticeBlock } from '@/app/components/container/message/notice-block';
import { AlertTriangle } from '@/app/components/Icon/alert-triangle';
import { FC, HTMLAttributes } from 'react';

export const PageActionButtonBlock: FC<
  {
    errorMessage?: string;
  } & HTMLAttributes<HTMLDivElement>
> = ({ errorMessage, children }) => {
  return (
    <div className="shrink-0 w-full">
      {errorMessage && (
        <RedNoticeBlock className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>{errorMessage}</span>
        </RedNoticeBlock>
      )}
      <div className="flex h-12 border-t border-gray-200 dark:border-gray-800">
        {children}
      </div>
    </div>
  );
};
