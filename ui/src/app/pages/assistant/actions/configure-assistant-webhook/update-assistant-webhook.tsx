import React, { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useConfirmDialog } from '@/app/pages/assistant/actions/hooks/use-confirmation';
import { useGlobalNavigation } from '@/hooks/use-global-navigator';
import {
  IBlueBGArrowButton,
  IBlueBorderButton,
  ICancelButton,
} from '@/app/components/form/button';
import { cn } from '@/utils';
import { FieldSet } from '@/app/components/form/fieldset';
import { FormLabel } from '@/app/components/form-label';
import { Input } from '@/app/components/form/input';
import { Select } from '@/app/components/form/select';
import { Textarea } from '@/app/components/form/textarea';
import { InputHelper } from '@/app/components/input-helper';
import { ArrowRight, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { Slider } from '@/app/components/form/slider';
import { GetAssistantWebhook, UpdateWebhook } from '@rapidaai/react';
import { useCurrentCredential } from '@/hooks/use-credential';
import { PageActionButtonBlock } from '@/app/components/blocks/page-action-button-block';
import { InputCheckbox } from '@/app/components/form/checkbox';
import toast from 'react-hot-toast/headless';
import { useRapidaStore } from '@/hooks';
import { connectionConfig } from '@/configs';
import { PageHeaderBlock } from '@/app/components/blocks/page-header-block';
import { PageTitleBlock } from '@/app/components/blocks/page-title-block';

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-500 dark:text-gray-400 whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
    </div>
  );
}

const webhookEvents = [
  {
    id: 'conversation.begin',
    name: 'conversation.begin',
    description: 'Triggered when a new conversation begins.',
    category: 'Conversation',
  },
  {
    id: 'conversation.completed',
    name: 'conversation.completed',
    description: 'Triggered when a conversation ends successfully.',
    category: 'Conversation',
  },
  {
    id: 'conversation.failed',
    name: 'conversation.failed',
    description: 'Triggered when a conversation fails.',
    category: 'Conversation',
  },
];

export const UpdateAssistantWebhook: FC<{ assistantId: string }> = ({
  assistantId,
}) => {
  let navigator = useGlobalNavigation();
  const { webhookId } = useParams();
  const { authId, token, projectId } = useCurrentCredential();
  const { loading, showLoader, hideLoader } = useRapidaStore();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [method, setMethod] = useState('POST');
  const [endpoint, setEndpoint] = useState('');
  const [description, setDescription] = useState('');
  const [retryOnStatus, setRetryOnStatus] = useState(['500']);
  const [maxRetries, setMaxRetries] = useState(3);
  const [requestTimeout, setRequestTimeout] = useState(180);
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [priority, setPriority] = useState<number>(0);
  const [parameters, setParameters] = useState<
    {
      type:
        | 'assistant'
        | 'event'
        | 'conversation'
        | 'argument'
        | 'metadata'
        | 'option'
        | 'analysis';
      key: string;
      value: string;
    }[]
  >([]);

  const updateParameter = (index: number, field: string, value: string) => {
    setParameters(prevParams =>
      prevParams.map((param, i) => {
        if (i === index) {
          const updatedParam = { ...param, [field]: value };
          if (field === 'type') {
            updatedParam.key = '';
            updatedParam.value = '';
          }
          return updatedParam;
        }
        return param;
      }),
    );
  };

  useEffect(() => {
    showLoader();
    GetAssistantWebhook(
      connectionConfig,
      assistantId,
      webhookId!,
      (err, res) => {
        hideLoader();
        if (err) {
          toast.error('Unable to assistant webhook, please try again later.');
          return;
        }
        const wb = res?.getData();
        if (wb) {
          setMethod(wb.getHttpmethod());
          setEndpoint(wb.getHttpurl());
          setDescription(wb.getDescription());
          setRetryOnStatus(wb.getRetrystatuscodesList());
          setMaxRetries(wb.getRetrycount());
          setRequestTimeout(wb.getTimeoutsecond());
          setPriority(wb.getExecutionpriority());
          const headersMap = wb.getHttpheadersMap();
          setHeaders(
            Array.from(headersMap.entries()).map(([key, value]) => ({
              key,
              value,
            })),
          );
          const parametersMap = wb.getHttpbodyMap();
          setParameters(
            Array.from(parametersMap.entries()).map(([key, value]) => {
              const [type, paramKey] = key.split('.');
              return {
                type: type as
                  | 'assistant'
                  | 'conversation'
                  | 'argument'
                  | 'metadata'
                  | 'option'
                  | 'analysis',
                key: paramKey,
                value,
              };
            }),
          );
          setEvents(wb.getAssistanteventsList());
        }
      },
      {
        'x-auth-id': authId,
        authorization: token,
        'x-project-id': projectId,
      },
    );
  }, [assistantId, webhookId, authId, token, projectId]);

  const { showDialog, ConfirmDialogComponent } = useConfirmDialog({});
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = () => {
    if (!endpoint) {
      setErrorMessage('Please provide a server url for the webhook.');
      return false;
    }
    if (!/^https?:\/\/.+/.test(endpoint)) {
      setErrorMessage('Please provide a valid server url for the webhook.');
      return false;
    }

    if (parameters.length === 0) {
      setErrorMessage(
        'Please provide one or more parameters which can be passed as data to your server.',
      );
      return false;
    }

    const keys = parameters.map(param => `${param.type}.${param.key}`);
    const uniqueKeys = new Set(keys);
    if (keys.length !== uniqueKeys.size) {
      setErrorMessage(`Duplicate parameter keys are not allowed.`);
      return false;
    }

    const emptyKeysOrValues = parameters.filter(
      param => param.key.trim() === '' || param.value.trim() === '',
    );
    if (emptyKeysOrValues.length > 0) {
      setErrorMessage(`Empty parameter keys or values are not allowed.`);
      return false;
    }
    const values = parameters.map(param => param.value.trim());
    const uniqueValues = new Set(values);
    if (values.length !== uniqueValues.size) {
      setErrorMessage(`Duplicate parameter values are not allowed.`);
      return false;
    }

    if (Object.values(events).every(v => !v)) {
      setErrorMessage(
        'Please select at least one event when the webhook will get triggered.',
      );
      return false;
    }

    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    showLoader();
    try {
      const parameterKeyValuePairs = parameters.map(param => ({
        key: `${param.type}.${param.key}`,
        value: param.value,
      }));

      UpdateWebhook(
        connectionConfig,
        assistantId,
        webhookId!,
        method,
        endpoint,
        headers,
        parameterKeyValuePairs,
        events,
        retryOnStatus,
        maxRetries,
        requestTimeout,
        priority,
        (err, response) => {
          hideLoader();
          if (err) {
            setErrorMessage(
              'Unable to update assistant webhook, please check and try again.',
            );
            return;
          }
          if (response?.getSuccess()) {
            toast.success(`Assistant's webhook updated successfully`);
            navigator.goToAssistantWebhook(assistantId);
          } else {
            if (response?.getError()) {
              let err = response.getError();
              const message = err?.getHumanmessage();
              if (message) {
                setErrorMessage(message);
                return;
              }
            }
            setErrorMessage(
              'Unable to update assistant webhook, please check and try again.',
            );
          }
        },
        {
          'x-auth-id': authId,
          authorization: token,
          'x-project-id': projectId,
        },
        description,
      );
    } catch (error) {
      setErrorMessage('Failed to configure webhook. Please try again.');
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      method="POST"
      className="relative flex flex-col flex-1"
    >
      <ConfirmDialogComponent />
      <div className="overflow-auto flex flex-col flex-1 pb-20">
        <PageHeaderBlock>
          <PageTitleBlock>Update Webhook</PageTitleBlock>
        </PageHeaderBlock>

        <div className="px-8 pt-6 pb-8 max-w-4xl flex flex-col gap-8">
          {/* Destination */}
          <div className="flex flex-col gap-6">
            <SectionDivider label="Destination" />
            <div className="flex gap-2">
              <FieldSet className="w-36 shrink-0">
                <FormLabel>Method</FormLabel>
                <Select
                  value={method}
                  onChange={e => setMethod(e.target.value)}
                  options={[
                    { name: 'POST', value: 'POST' },
                    { name: 'PUT', value: 'PUT' },
                    { name: 'PATCH', value: 'PATCH' },
                  ]}
                />
              </FieldSet>
              <FieldSet className="w-full">
                <FormLabel>Server URL</FormLabel>
                <Input
                  value={endpoint}
                  onChange={e => setEndpoint(e.target.value)}
                  placeholder="https://your-domain.com/webhook"
                  required
                />
                <InputHelper>
                  The HTTPS endpoint that will receive the webhook payload.
                </InputHelper>
              </FieldSet>
            </div>
            <FieldSet>
              <FormLabel>Description (Optional)</FormLabel>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="An optional description of this webhook destination..."
                rows={2}
              />
            </FieldSet>
          </div>

          {/* Headers */}
          <div className="flex flex-col gap-6">
            <SectionDivider label={`Headers (${headers.length})`} />
            <FieldSet>
              <div className="text-sm grid w-full divide-y divide-gray-200 dark:divide-gray-700">
                {headers.map((header, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-2 border-b border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex col-span-1 items-center border-r border-gray-200 dark:border-gray-700">
                      <Input
                        value={header.key}
                        onChange={e => {
                          const newHeaders = [...headers];
                          newHeaders[index].key = e.target.value;
                          setHeaders(newHeaders);
                        }}
                        placeholder="Key"
                        className="w-full border-none"
                      />
                    </div>
                    <div className="col-span-1 flex">
                      <Input
                        value={header.value}
                        onChange={e => {
                          const newHeaders = [...headers];
                          newHeaders[index].value = e.target.value;
                          setHeaders(newHeaders);
                        }}
                        placeholder="Value"
                        className="w-full border-none"
                      />
                      <ICancelButton
                        className="border-none outline-hidden bg-light-background"
                        onClick={() =>
                          setHeaders(headers.filter((_, i) => i !== index))
                        }
                        type="button"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </ICancelButton>
                    </div>
                  </div>
                ))}
              </div>
              <IBlueBorderButton
                onClick={() => setHeaders([...headers, { key: '', value: '' }])}
                className="justify-between space-x-8"
                type="button"
              >
                <span>Add header</span>
                <Plus className="h-4 w-4 ml-1.5" />
              </IBlueBorderButton>
            </FieldSet>
          </div>

          {/* Payload */}
          <div className="flex flex-col gap-6">
            <SectionDivider label={`Payload (${parameters.length})`} />
            <FieldSet>
              <div className="text-sm grid w-full">
                {parameters.map((params, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-2 border-b border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex col-span-1 items-center">
                      <Select
                        value={params.type}
                        onChange={e =>
                          updateParameter(index, 'type', e.target.value)
                        }
                        className="border-none"
                        options={[
                          { name: 'Assistant', value: 'assistant' },
                          { name: 'Conversation', value: 'conversation' },
                          { name: 'Argument', value: 'argument' },
                          { name: 'Metadata', value: 'metadata' },
                          { name: 'Option', value: 'option' },
                          { name: 'Analysis', value: 'analysis' },
                          { name: 'Event', value: 'event' },
                        ]}
                      />
                      <TypeKeySelector
                        type={params.type}
                        value={params.key}
                        onChange={newKey =>
                          updateParameter(index, 'key', newKey)
                        }
                      />
                      <div className="bg-light-background dark:bg-gray-950 h-full flex items-center justify-center px-2">
                        <ArrowRight strokeWidth={1.5} className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="col-span-1 flex">
                      <Input
                        value={params.value}
                        onChange={e =>
                          updateParameter(index, 'value', e.target.value)
                        }
                        placeholder="Value"
                        className="w-full border-none"
                      />
                      <ICancelButton
                        className="border-none outline-hidden dark:bg-gray-950"
                        onClick={() =>
                          setParameters(
                            parameters.filter((_, i) => i !== index),
                          )
                        }
                        type="button"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </ICancelButton>
                    </div>
                  </div>
                ))}
              </div>
              <IBlueBorderButton
                onClick={() =>
                  setParameters([
                    ...parameters,
                    { type: 'assistant', key: '', value: '' },
                  ])
                }
                className="justify-between space-x-8"
                type="button"
              >
                <span>Add parameter</span>
                <Plus className="h-4 w-4 ml-1.5" />
              </IBlueBorderButton>
            </FieldSet>
          </div>

          {/* Events */}
          <div className="flex flex-col gap-6">
            <SectionDivider label="Events" />
            <FieldSet>
              <div className="grid grid-cols-2 gap-4">
                {webhookEvents.map(event => (
                  <div key={event.id} className="flex items-start">
                    <div className="flex h-4 items-center mt-2">
                      <InputCheckbox
                        id={event.id}
                        checked={events.includes(event.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setEvents([...events, event.id]);
                          } else {
                            setEvents(events.filter(id => id !== event.id));
                          }
                        }}
                      />
                    </div>
                    <FieldSet className="ml-3 space-y-0.5!">
                      <FormLabel
                        htmlFor={event.id}
                        className="font-medium text-base dark:text-gray-400"
                      >
                        {event.name}
                      </FormLabel>
                      <InputHelper>{event.description}</InputHelper>
                    </FieldSet>
                  </div>
                ))}
              </div>
            </FieldSet>
          </div>

          {/* Advanced settings */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <ChevronDown
              className={cn(
                'w-4 h-4 transition-transform duration-200',
                showAdvanced && 'rotate-180',
              )}
              strokeWidth={2}
            />
            {showAdvanced ? 'Hide' : 'Show'} advanced settings
          </button>

          {showAdvanced && (
            <div className="flex flex-col gap-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <SectionDivider label="Retry" />
              <FieldSet className="w-60 shrink-0">
                <FormLabel>Max retry count</FormLabel>
                <Select
                  value={maxRetries.toString()}
                  onChange={e => setMaxRetries(parseInt(e.target.value))}
                  options={[
                    { name: '1', value: '1' },
                    { name: '2', value: '2' },
                    { name: '3', value: '3' },
                  ]}
                />
              </FieldSet>
              <FieldSet>
                <FormLabel>Retry on status codes</FormLabel>
                <div className="flex flex-wrap gap-4">
                  {['40X', '50X'].map(status => (
                    <label key={status} className="flex items-center gap-2">
                      <InputCheckbox
                        checked={retryOnStatus.includes(status)}
                        onChange={e => {
                          if (e.target.checked) {
                            setRetryOnStatus([...retryOnStatus, status]);
                          } else {
                            setRetryOnStatus(
                              retryOnStatus.filter(s => s !== status),
                            );
                          }
                        }}
                      />
                      <span className="text-sm">{status}</span>
                    </label>
                  ))}
                </div>
              </FieldSet>

              <SectionDivider label="Timeout" />
              <FieldSet>
                <FormLabel>Timeout (seconds)</FormLabel>
                <div className="flex items-center gap-4">
                  <Slider
                    min={180}
                    max={300}
                    step={1}
                    value={requestTimeout}
                    onSlide={value => setRequestTimeout(value)}
                    className="w-64"
                  />
                  <Input
                    id="request_timeout"
                    name="request_timeout"
                    type="number"
                    min={180}
                    max={300}
                    step={1}
                    value={requestTimeout}
                    onChange={e => setRequestTimeout(Number(e.target.value))}
                    className="w-16 h-9 bg-light-background"
                  />
                </div>
              </FieldSet>

              <SectionDivider label="Execution" />
              <FieldSet className="w-40">
                <FormLabel>Priority</FormLabel>
                <Input
                  type="number"
                  min={0}
                  value={priority}
                  onChange={e => setPriority(Number(e.target.value))}
                />
                <InputHelper>
                  Lower numbers execute first when multiple webhooks are
                  triggered.
                </InputHelper>
              </FieldSet>
            </div>
          )}
        </div>
      </div>

      <PageActionButtonBlock errorMessage={errorMessage}>
        <ICancelButton
          className="w-full h-full"
          onClick={() => showDialog(navigator.goBack)}
          type="button"
        >
          Cancel
        </ICancelButton>
        <IBlueBGArrowButton
          isLoading={loading}
          type="submit"
          className="w-full h-full"
        >
          Update webhook
        </IBlueBGArrowButton>
      </PageActionButtonBlock>
    </form>
  );
};

export const TypeKeySelector: FC<{
  type:
    | 'event'
    | 'assistant'
    | 'conversation'
    | 'argument'
    | 'metadata'
    | 'option'
    | 'analysis';
  value: string;
  onChange: (newValue: string) => void;
}> = ({ type, value, onChange }) => {
  switch (type) {
    case 'event':
      return (
        <Select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="border-none"
          options={[
            { name: 'Type', value: 'type' },
            { name: 'Data', value: 'data' },
          ]}
        />
      );
    case 'assistant':
      return (
        <Select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="border-none"
          options={[
            { name: 'ID', value: 'id' },
            { name: 'Name', value: 'name' },
            { name: 'Version', value: 'version' },
          ]}
        />
      );
    case 'conversation':
      return (
        <Select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="border-none"
          options={[
            { name: 'Messages', value: 'messages' },
            { name: 'ID', value: 'id' },
          ]}
        />
      );
    default:
      return (
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Key"
          className="w-full border-none"
        />
      );
  }
};
