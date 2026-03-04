import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react';
import { Spinner } from '@/app/components/loader/spinner';
import React, { ChangeEvent, Fragment, HTMLAttributes } from 'react';
import { cn } from '@/utils';
import { SearchIconInput } from '@/app/components/form/input/IconInput';
import { Check, ChevronDown } from 'lucide-react';
import { Float } from '@headlessui-float/react';
/**
 *
 */
export interface DropdownProps<T> extends HTMLAttributes<HTMLDivElement> {
  currentValue?: T | null;
  setValue: (value: T) => void;
  allValue: T[];
  option?: (value: T, isSelected: boolean) => React.ReactElement;
  label?: (value: T) => React.ReactElement;
  placeholder?: string;
  multiple?: boolean;
  disable?: boolean;
  placement?: 'bottom' | 'top';
  searchable?: boolean;
  onSearching?: (qry: ChangeEvent<HTMLInputElement>) => void;
}
/**
 *
 * @param props
 * @returns
 */
export function Dropdown(props: DropdownProps<any>) {
  return (
    <div className="relative flex flex-1">
      <Listbox
        value={props.currentValue || null}
        onChange={props.setValue}
        multiple={props.multiple}
        disabled={props.disable}
      >
        {({ open }) => (
          <Float
            floatingAs={Fragment}
            placement={props.placement ? props.placement : 'bottom'}
            flip
            shift
            offset={4}
          >
            <ListboxButton
              aria-label={props.placeholder}
              onClick={() => {
                if (props.disable) return;
              }}
              className={cn(
                'w-full',
                'h-10 cursor-default relative',
                'py-2 pl-4 pr-10 text-left',
                // Carbon field background
                'bg-light-background dark:bg-gray-950',
                // Carbon inset focus outline — matches Input/Select
                'outline-solid outline-[1.5px] outline-transparent outline-offset-[-1.5px]',
                'focus:outline-primary focus:border-primary dark:focus:border-primary',
                // Carbon bottom border only
                'border-0 border-b border-gray-300 dark:border-gray-700',
                'transition-colors duration-100',
                'dark:text-gray-300 text-gray-700',
                'rounded-none',
                'flex items-center',
                props.disable && 'cursor-not-allowed!',
                props.className,
              )}
              type="button"
            >
              {props.disable ? (
                <Spinner className="mr-2" />
              ) : props.allValue.length === 0 ? (
                <span className="inline-flex items-center gap-1.5 sm:gap-2 max-w-full">
                  <span className="truncate sm:max-w-[300px] max-w-[120px] form-input  dark:text-gray-600 text-gray-400">
                    {props.placeholder}
                  </span>
                </span>
              ) : props.currentValue ? (
                props.label?.(props.currentValue) ?? props.currentValue
              ) : (
                <span className="inline-flex items-center gap-1.5 sm:gap-2 max-w-full">
                  <span className="truncate sm:max-w-[300px] max-w-[120px] form-input  dark:text-gray-600 text-gray-400">
                    {props.placeholder}
                  </span>
                </span>
              )}
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronDown
                  className={cn(
                    'w-4 h-4 ml-2 opacity-50 shrink-0 transition-all delay-200',
                    open && 'rotate-180',
                  )}
                />
              </span>
            </ListboxButton>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <ListboxOptions
                className={cn(
                  'shadow-lg',
                  'z-50 max-h-96 w-full overflow-y-auto',
                  // Carbon $border-strong-01 border around the floating panel
                  'border border-gray-300 dark:border-gray-700',
                  'bg-light-background dark:bg-gray-900',
                  'dark:text-gray-300 text-gray-700',
                  'divide-y divide-gray-200 dark:divide-gray-800',
                  'outline-hidden rounded-none',
                )}
              >
                {props.searchable && (
                  <div className="px-4 py-3 sticky top-0 bg-light-background dark:bg-gray-900 z-10 border-b border-gray-200 dark:border-gray-800">
                    <SearchIconInput
                      className="bg-white dark:bg-gray-950"
                      wrapperClassName="w-full!"
                      onChange={props.onSearching}
                    />
                  </div>
                )}

                {props.allValue.map((mp, idx) => {
                  return (
                    <ListboxOption
                      as="div"
                      key={idx}
                      value={mp}
                      className={cn(
                        // Carbon dropdown item: h-10 (40px), px-4 ($spacing-05)
                        'inline-flex min-h-10 py-2.5 px-4 w-full relative',
                        'items-center leading-5',
                        'transition-colors ease justify-between',
                        // Carbon $layer-hover
                        'hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer',
                      )}
                    >
                      {({ selected }) => (
                        <>
                          {props.option && props.option(mp, selected)}
                          {selected && (
                            <span className="h-4 w-4 rounded-[2px] bg-primary p-[2px] ml-auto flex items-center justify-center shrink-0">
                              <Check className="text-white" />
                            </span>
                          )}
                        </>
                      )}
                    </ListboxOption>
                  );
                })}
              </ListboxOptions>
            </Transition>
          </Float>
        )}
      </Listbox>
    </div>
  );
}
