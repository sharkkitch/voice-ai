import { RedNoticeBlock } from '@/app/components/container/message/notice-block';
import { AlertTriangle } from '@/app/components/Icon/alert-triangle';
import { FC, HTMLAttributes } from 'react';
import React from 'react';

interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  errorMessage?: string;
}

export const ModalFooter: FC<ModalFooterProps> = ({
  errorMessage,
  children,
}) => {
  return (
    <div className="flex flex-col shrink-0">
      {errorMessage && (
        <RedNoticeBlock className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </RedNoticeBlock>
      )}
      <div className="flex h-12 border-t border-gray-200 dark:border-gray-800">
        {React.Children.map(children, (child, i) => (
          <div key={i} className="flex-1 h-full [&>*]:!w-full [&>*]:!h-full">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};
