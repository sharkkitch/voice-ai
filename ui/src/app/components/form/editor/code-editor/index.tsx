import type { FC } from 'react';
import { useRef } from 'react';
import { useBoolean } from 'ahooks';
import { cn } from '@/utils';
import { useToggleExpend } from '@/hooks/use-toggle-expend';
import { JsonEditor } from '@/app/components/json-editor';
import { Copy, Checkmark, Maximize, Minimize } from '@carbon/icons-react';
import { Button } from '@carbon/react';

type CodeEditorProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export const CodeEditor: FC<CodeEditorProps> = ({
  placeholder,
  value,
  onChange,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { isExpand, setIsExpand } = useToggleExpend(ref);
  const [isFocus, { setTrue: setFocus, setFalse: setBlur }] = useBoolean(false);
  const [isChecked, { setTrue: setChecked, setFalse: setUnCheck }] =
    useBoolean(false);

  const handlePromptChange = (newValue: string) => {
    if (value === newValue) return;
    onChange(newValue);
  };

  const copyItem = (item: string) => {
    setChecked();
    navigator.clipboard.writeText(item);
    setTimeout(() => setUnCheck(), 4000);
  };

  return (
    <div
      ref={ref}
      className={cn(
        'group relative',
        'border border-gray-200 dark:border-gray-700',
        'transition-all duration-200 ease-in-out',
        isFocus && 'border-blue-600! ring-1 ring-blue-600',
        isExpand && 'fixed top-0 bottom-0 right-0 left-0 h-full z-50 m-0! p-0!',
      )}
    >
      <div className="flex items-center absolute right-1 top-1 z-20 invisible group-hover:visible">
        <Button
          hasIconOnly
          renderIcon={isChecked ? Checkmark : Copy}
          iconDescription="Copy"
          kind="ghost"
          size="sm"
          onClick={() => copyItem(value)}
          tabIndex={-1}
        />
        <Button
          hasIconOnly
          renderIcon={isExpand ? Minimize : Maximize}
          iconDescription={isExpand ? 'Minimize' : 'Maximize'}
          kind="ghost"
          size="sm"
          onClick={() => setIsExpand(!isExpand)}
          tabIndex={-1}
        />
      </div>

      <JsonEditor
        className={cn(
          'min-h-52 overflow-auto p-2',
          className,
          isExpand && 'h-screen p-4',
        )}
        placeholder={placeholder}
        value={value}
        onFocus={setFocus}
        onChange={handlePromptChange}
        onBlur={setBlur}
      />
    </div>
  );
};
