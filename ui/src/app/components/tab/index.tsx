import { TabBody } from '@/app/components/tab/tab-body';
import { TabHeader } from '@/app/components/tab/tab-header';
import { cn } from '@/utils';
import React, { FC, HTMLAttributes, useState } from 'react';

export interface TabProps extends HTMLAttributes<HTMLDivElement> {
  active: string;
  tabs: {
    label: string;
    labelIcon?: React.ReactElement;
    element: React.ReactElement;
  }[];
  strict?: boolean;
  linkClass?: string;
}
export const Tab: FC<TabProps> = ({
  active,
  tabs,
  className,
  strict = true,
}) => {
  const [isActive, setIsActive] = useState(active);
  return (
    <>
      <TabHeader className={className}>
        <div className="flex items-stretch h-10">
          {tabs.map((ix, id) => {
            return (
              <div
                key={id}
                onClick={() => {
                  setIsActive(ix.label);
                }}
                className={cn(
                  'relative flex items-center gap-2 px-4 cursor-pointer text-xs font-medium uppercase tracking-[0.08em] whitespace-nowrap transition-colors',
                  isActive === ix.label
                    ? 'text-gray-900 dark:text-gray-100 after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-primary'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
                )}
              >
                {ix.labelIcon}
                {ix.label}
              </div>
            );
          })}
        </div>
      </TabHeader>
      {strict
        ? tabs.map((ix, id) => {
            return (
              <TabBody
                key={id}
                className={cn(ix.label === isActive ? 'flex' : 'hidden')}
              >
                {ix.element}
              </TabBody>
            );
          })
        : tabs
            .filter(x => x.label === isActive)
            .map((ix, id) => {
              return <TabBody key={id}>{ix.element}</TabBody>;
            })}
    </>
  );
};

export const SideTab: FC<TabProps> = ({
  active,
  tabs,
  className,
  strict = true,
}) => {
  const [isActive, setIsActive] = useState(active);
  return (
    <>
      <TabHeader className={cn(className, 'border-none')}>
        <div className="flex flex-col border-r border-gray-200 dark:border-gray-800 h-full pt-2">
          {tabs.map((ix, id) => {
            return (
              <div
                key={id}
                onClick={() => {
                  setIsActive(ix.label);
                }}
                className={cn(
                  'cursor-pointer flex items-center gap-2 h-8 px-4 border-l-2 text-sm font-medium whitespace-nowrap transition-colors',
                  isActive === ix.label
                    ? 'border-l-primary text-primary bg-primary/10'
                    : 'border-l-transparent text-gray-600 dark:text-gray-400 hover:bg-primary/5 hover:text-primary',
                )}
              >
                {ix.labelIcon}
                {ix.label}
              </div>
            );
          })}
        </div>
      </TabHeader>
      {strict
        ? tabs.map((ix, id) => {
            return (
              <TabBody
                key={id}
                className={cn(ix.label === isActive ? 'flex ' : 'hidden')}
              >
                {ix.element}
              </TabBody>
            );
          })
        : tabs
            .filter(x => x.label === isActive)
            .map((ix, id) => {
              return <TabBody key={id}>{ix.element}</TabBody>;
            })}
    </>
  );
};
