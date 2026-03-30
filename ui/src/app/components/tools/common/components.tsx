import { FC, useState, useCallback } from 'react';
import { cn } from '@/utils';
import { CodeEditor } from '@/app/components/form/editor/code-editor';
import { DocNoticeBlock } from '@/app/components/container/message/notice-block/doc-notice-block';
import { Add, TrashCan, ArrowRight } from '@carbon/icons-react';
import { TertiaryButton, DangerTertiaryButton } from '@/app/components/carbon/button';
import { Stack, TextInput, TextArea } from '@/app/components/carbon/form';
import { Select, SelectItem, Button } from '@carbon/react';
import {
  ToolDefinition,
  ParameterType,
  KeyValueParameter,
  PARAMETER_TYPE_OPTIONS,
  ASSISTANT_KEY_OPTIONS,
  CONVERSATION_KEY_OPTIONS,
  TOOL_KEY_OPTIONS,
} from './types';
import { parseJsonParameters, stringifyParameters } from './hooks';

// ============================================================================
// Documentation Notice Block
// ============================================================================

interface DocumentationNoticeProps {
  title?: string;
  documentationUrl: string;
}

export const DocumentationNotice: FC<DocumentationNoticeProps> = ({
  title = 'Know more about knowledge tool definition that can be supported by rapida',
  documentationUrl,
}) => (
  <DocNoticeBlock docUrl={documentationUrl}>{title}</DocNoticeBlock>
);

// ============================================================================
// Tool Definition Form
// ============================================================================

interface ToolDefinitionFormProps {
  toolDefinition: ToolDefinition;
  onChangeToolDefinition: (value: ToolDefinition) => void;
  inputClass?: string;
  documentationUrl?: string;
  documentationTitle?: string;
}

export const ToolDefinitionForm: FC<ToolDefinitionFormProps> = ({
  toolDefinition,
  onChangeToolDefinition,
  inputClass,
  documentationUrl = 'https://doc.rapida.ai/assistants/overview',
  documentationTitle,
}) => {
  const handleChange = <K extends keyof ToolDefinition>(
    field: K,
    value: ToolDefinition[K],
  ) => {
    onChangeToolDefinition({ ...toolDefinition, [field]: value });
  };

  return (
    <div>
      <DocumentationNotice
        title={documentationTitle}
        documentationUrl={documentationUrl}
      />
      <div className="mt-4 max-w-6xl">
        <Stack gap={6}>
          <TextInput
            id="tool-name"
            labelText="Name"
            value={toolDefinition.name}
            onChange={e => handleChange('name', e.target.value)}
            placeholder="Enter tool name"
          />
          <TextArea
            id="tool-description"
            labelText="Description"
            value={toolDefinition.description}
            onChange={e => handleChange('description', e.target.value)}
            placeholder="A tool description or definition of when this tool will get triggered."
            rows={2}
          />
          <div>
            <p className="text-xs font-medium mb-2">Parameters</p>
            <CodeEditor
              placeholder="Provide a tool parameters that will be passed to llm"
              value={toolDefinition.parameters}
              onChange={value => handleChange('parameters', value)}
              className={cn(
                'min-h-40 max-h-dvh bg-light-background dark:bg-gray-950',
                inputClass,
              )}
            />
          </div>
        </Stack>
      </div>
    </div>
  );
};

// ============================================================================
// Type Key Selector
// ============================================================================

interface TypeKeySelectorProps {
  type: ParameterType;
  value: string;
  onChange: (newValue: string) => void;
  inputClass?: string;
}

export const TypeKeySelector: FC<TypeKeySelectorProps> = ({
  type,
  value,
  onChange,
  inputClass,
}) => {
  const options = (() => {
    switch (type) {
      case 'assistant': return ASSISTANT_KEY_OPTIONS;
      case 'conversation': return CONVERSATION_KEY_OPTIONS;
      case 'tool': return TOOL_KEY_OPTIONS;
      default: return null;
    }
  })();

  if (options) {
    return (
      <Select
        id={`key-${type}-${value}`}
        labelText=""
        hideLabel
        value={value}
        onChange={e => onChange(e.target.value)}
        className={cn('flex-1', inputClass)}
      >
        {options.map(opt => (
          <SelectItem key={opt.value} value={opt.value} text={opt.name} />
        ))}
      </Select>
    );
  }

  return (
    <TextInput
      id={`key-custom-${value}`}
      labelText=""
      hideLabel
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Key"
      size="md"
    />
  );
};

// ============================================================================
// Parameter Row
// ============================================================================

interface ParameterRowProps {
  type: ParameterType;
  paramKey: string;
  value: string;
  inputClass?: string;
  typeOptions: Array<{ name: string; value: string }>;
  onTypeChange: (type: string) => void;
  onKeyChange: (key: string) => void;
  onValueChange: (value: string) => void;
  onRemove: () => void;
}

export const ParameterRow: FC<ParameterRowProps> = ({
  type,
  paramKey,
  value,
  inputClass,
  typeOptions,
  onTypeChange,
  onKeyChange,
  onValueChange,
  onRemove,
}) => (
  <div className="grid grid-cols-2 border-b border-gray-200 dark:border-gray-700">
    <div className="flex col-span-1 items-center">
      <Select
        id={`type-${paramKey}`}
        labelText=""
        hideLabel
        value={type}
        onChange={e => onTypeChange(e.target.value)}
        className={cn('flex-shrink-0', inputClass)}
      >
        {typeOptions.map(opt => (
          <SelectItem key={opt.value} value={opt.value} text={opt.name} />
        ))}
      </Select>
      <TypeKeySelector
        type={type}
        inputClass={inputClass}
        value={paramKey}
        onChange={onKeyChange}
      />
      <div className="h-10 flex items-center justify-center px-2">
        <ArrowRight size={16} />
      </div>
    </div>
    <div className="col-span-1 flex items-center">
      <TextInput
        id={`value-${paramKey}`}
        labelText=""
        hideLabel
        value={value}
        onChange={e => onValueChange(e.target.value)}
        placeholder="Value"
        size="md"
        className="flex-1"
      />
      <Button
        hasIconOnly
        renderIcon={TrashCan}
        iconDescription="Remove"
        kind="danger--ghost"
        size="md"
        onClick={onRemove}
      />
    </div>
  </div>
);

// ============================================================================
// Parameter Editor
// ============================================================================

interface ParameterEditorProps {
  value: string;
  onChange: (value: string) => void;
  typeOptions?: Array<{ name: string; value: string }>;
  defaultNewType?: string;
  inputClass?: string;
}

export const ParameterEditor: FC<ParameterEditorProps> = ({
  value,
  onChange,
  typeOptions = [...PARAMETER_TYPE_OPTIONS],
  defaultNewType = 'assistant',
  inputClass,
}) => {
  const [params, setParams] = useState<KeyValueParameter[]>(() =>
    parseJsonParameters(value),
  );

  const commit = useCallback(
    (next: KeyValueParameter[]) => {
      setParams(next);
      onChange(stringifyParameters(next));
    },
    [onChange],
  );

  const handleTypeChange = useCallback(
    (index: number, newType: string) => {
      const next = [...params];
      next[index] = { key: `${newType}.`, value: '' };
      commit(next);
    },
    [params, commit],
  );

  const handleKeyChange = useCallback(
    (index: number, newKey: string) => {
      const next = [...params];
      const [type] = params[index].key.split('.');
      next[index] = { ...params[index], key: `${type}.${newKey}` };
      commit(next);
    },
    [params, commit],
  );

  const handleValueChange = useCallback(
    (index: number, newValue: string) => {
      const next = [...params];
      next[index] = { ...params[index], value: newValue };
      commit(next);
    },
    [params, commit],
  );

  const handleRemove = useCallback(
    (index: number) => {
      commit(params.filter((_, i) => i !== index));
    },
    [params, commit],
  );

  const handleAdd = useCallback(() => {
    commit([...params, { key: `${defaultNewType}.`, value: '' }]);
  }, [params, commit, defaultNewType]);

  return (
    <div>
      <p className="text-xs font-medium mb-2">Parameters ({params.length})</p>
      <div className="text-sm grid w-full">
        {params.map(({ key, value: val }, index) => {
          const [type, pk] = key.split('.');
          return (
            <ParameterRow
              key={index}
              type={type as ParameterType}
              paramKey={pk}
              value={val}
              inputClass={inputClass}
              typeOptions={typeOptions}
              onTypeChange={newType => handleTypeChange(index, newType)}
              onKeyChange={newKey => handleKeyChange(index, newKey)}
              onValueChange={newValue => handleValueChange(index, newValue)}
              onRemove={() => handleRemove(index)}
            />
          );
        })}
      </div>
      <TertiaryButton
        size="md"
        renderIcon={Add}
        onClick={handleAdd}
        className="mt-2"
      >
        Add parameter
      </TertiaryButton>
    </div>
  );
};
