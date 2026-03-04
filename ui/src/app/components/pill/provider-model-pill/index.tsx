import { allProvider, RapidaProvider } from '@/providers';
import { cn } from '@/utils';
import { FC, HTMLAttributes, useEffect, useState } from 'react';

/**
 *
 */
interface ProviderPillProps extends HTMLAttributes<HTMLSpanElement> {
  provider?: string;
}

/**
 *
 * @param props
 * @returns
 */
export const ProviderPill: FC<ProviderPillProps> = props => {
  //
  const [currentProvider, setcurrentProvider] = useState<RapidaProvider | null>(
    null,
  );

  useEffect(() => {
    if (props.provider) {
      let cModel = allProvider().find(
        x => x.code.toLowerCase() === props.provider?.toLowerCase(),
      );
      if (cModel) setcurrentProvider(cModel);
    }
  }, [props.provider]);

  return (
    <span
      onClick={props.onClick}
      className={cn(
        'inline-flex items-center gap-1.5 h-6 px-2 w-fit',
        'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700',
        'text-xs text-gray-700 dark:text-gray-300',
        props.className,
      )}
    >
      <img
        alt={currentProvider?.name}
        src={currentProvider?.image}
        className="w-3.5 h-3.5 shrink-0"
      />
      <span className="truncate">{currentProvider?.name}</span>
    </span>
  );
};
