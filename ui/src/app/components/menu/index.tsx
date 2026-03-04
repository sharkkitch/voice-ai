import React, { FC, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { cn } from '@/utils';
import { Float } from '@headlessui-float/react';
import { DotIcon } from '@/app/components/Icon/Dot';
import { ChevronDown } from 'lucide-react';

interface OptionMenuProps {
  /*
  options that will be listed
   */
  options: { option: any; onActionClick: () => void }[];
  classNames?: string;
  activeClassName?: string;
}

export const OptionMenu: FC<OptionMenuProps> = props => {
  return (
    <Menu as="div" className="inline-block text-left w-fit relative">
      {({ open }) => (
        <Float placement="bottom-end" portal>
          <Menu.Button
            className={cn(
              'bg-gray-100 dark:bg-gray-950/40 dark:hover:bg-gray-950 hover:bg-gray-200 focus:outline-hidden hover:shadow-sm',
              'p-1.5',
              open && 'dark:bg-gray-950 bg-gray-200',
            )}
          >
            <span
              className={cn(
                'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-no-wrap border-0',
              )}
            >
              Menu
            </span>
            <DotIcon className="h-5 w-5 opacity-50" />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Menu.Items className="z-20 focus:outline-none w-max min-w-48">
              <div className="relative h-0 overflow-visible">
                <span className="absolute right-3 -top-[6px] w-3 h-3 rotate-45 bg-white dark:bg-gray-900 shadow-[-2px_-2px_3px_rgba(0,0,0,0.12)]" />
              </div>
              <div className="bg-white dark:bg-gray-900 shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
                {props.options.map((opt, idx) => {
                  const isDanger =
                    React.isValidElement(opt.option) &&
                    (opt.option as React.ReactElement).type === OptionMenuItem &&
                    (opt.option as React.ReactElement).props.type === 'danger';
                  return (
                    <Fragment key={`opt-menu-${idx}`}>
                      {isDanger && (
                        <div className="border-t border-gray-200 dark:border-gray-800" />
                      )}
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={opt.onActionClick}
                            className={cn(
                              'flex w-full items-center h-10 px-4 text-sm text-gray-700 dark:text-gray-300 transition-colors',
                              active && 'bg-gray-100 dark:bg-gray-800',
                            )}
                          >
                            {opt.option}
                          </button>
                        )}
                      </Menu.Item>
                    </Fragment>
                  );
                })}
              </div>
            </Menu.Items>
          </Transition>
        </Float>
      )}
    </Menu>
  );
};

export const CardOptionMenu: FC<OptionMenuProps> = props => {
  return (
    <Menu as="div" className="inline-block text-left w-fit relative">
      {({ open }) => (
        <Float placement="bottom-end" portal>
          <Menu.Button
            className={cn(
              'flex h-full w-10 justify-center items-center',
              'text-gray-500 dark:text-gray-400',
              'hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
              open && 'bg-gray-100 dark:bg-gray-800',
              props.classNames,
            )}
          >
            <span className="sr-only">Menu</span>
            <ChevronDown
              className={cn('w-4 h-4 transition-transform duration-150', open && 'rotate-180')}
              strokeWidth={1.5}
            />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            {/* Carbon popover — caret + shadow-only, no border, no rounded */}
            <Menu.Items className="z-20 focus:outline-none w-max min-w-48">
              {/* Caret pointing up toward trigger */}
              <div className="relative h-0 overflow-visible">
                <span className="absolute right-3 -top-[6px] w-3 h-3 rotate-45 bg-white dark:bg-gray-900 shadow-[-2px_-2px_3px_rgba(0,0,0,0.12)]" />
              </div>
              {/* Popover body */}
              <div className="bg-white dark:bg-gray-900 shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
                {props.options.map((opt, idx) => {
                  const isDanger =
                    React.isValidElement(opt.option) &&
                    (opt.option as React.ReactElement).type === OptionMenuItem &&
                    (opt.option as React.ReactElement).props.type === 'danger';
                  return (
                    <Fragment key={`opt-menu-${idx}`}>
                      {isDanger && (
                        <div className="border-t border-gray-200 dark:border-gray-800" />
                      )}
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={opt.onActionClick}
                            className={cn(
                              'flex w-full items-center h-10 px-4 text-sm text-gray-700 dark:text-gray-300 transition-colors',
                              active && 'bg-gray-100 dark:bg-gray-800',
                            )}
                          >
                            {opt.option}
                          </button>
                        )}
                      </Menu.Item>
                    </Fragment>
                  );
                })}
              </div>
            </Menu.Items>
          </Transition>
        </Float>
      )}
    </Menu>
  );
};

export function OptionMenuItem(props: {
  type: 'danger' | 'info';
  children?: any;
}) {
  return props.type === 'danger' ? (
    <span className="text-rose-600 dark:text-rose-500">{props.children}</span>
  ) : (
    <></>
  );
}
