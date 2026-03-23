import React, { FC, useState } from 'react';
import {
  CreateAssistantTelemetryProvider,
  Metadata,
} from '@rapidaai/react';
import { useGlobalNavigation } from '@/hooks/use-global-navigator';
import { useCurrentCredential } from '@/hooks/use-credential';
import { useRapidaStore } from '@/hooks';
import { connectionConfig } from '@/configs';
import toast from 'react-hot-toast/headless';
import {
  IBlueBGArrowButton,
  IBlueBorderButton,
  ICancelButton,
  IRedBorderButton,
} from '@/app/components/form/button';
import { FieldSet } from '@/app/components/form/fieldset';
import { FormLabel } from '@/app/components/form-label';
import { Select } from '@/app/components/form/select';
import { Input } from '@/app/components/form/input';
import { InputCheckbox } from '@/app/components/form/checkbox';
import { InputHelper } from '@/app/components/input-helper';
import { Plus, Trash2 } from 'lucide-react';
import { useConfirmDialog } from '@/app/pages/assistant/actions/hooks/use-confirmation';
import { TELEMETRY_PROVIDER } from '@/providers';

const providerOptions = TELEMETRY_PROVIDER.map(p => ({
  name: p.name,
  value: p.code,
}));

const providerConfigByCode = new Map(
  TELEMETRY_PROVIDER.map(p => [p.code, p.configurations ?? []]),
);

export const CreateAssistantTelemetry: FC<{ assistantId: string }> = ({
  assistantId,
}) => {
  const navigator = useGlobalNavigation();
  const { authId, token, projectId } = useCurrentCredential();
  const { showLoader, hideLoader } = useRapidaStore();
  const { showDialog, ConfirmDialogComponent } = useConfirmDialog({});

  const [providerType, setProviderType] = useState(
    providerOptions[0]?.value || 'otlp_http',
  );
  const [enabled, setEnabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [options, setOptions] = useState<{ key: string; value: string }[]>([
    { key: 'endpoint', value: '' },
  ]);

  const updateOption = (index: number, field: 'key' | 'value', value: string) => {
    setOptions(prev =>
      prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt)),
    );
  };

  const buildMetadata = (): Metadata[] => {
    return options
      .filter(opt => opt.key.trim() !== '' && opt.value.trim() !== '')
      .map(opt => {
        const m = new Metadata();
        m.setKey(opt.key.trim());
        m.setValue(opt.value.trim());
        return m;
      });
  };

  const validate = (): boolean => {
    setErrorMessage('');

    const nonEmpty = options.filter(
      opt => opt.key.trim() !== '' || opt.value.trim() !== '',
    );

    const hasHalfEmpty = nonEmpty.some(
      opt => opt.key.trim() === '' || opt.value.trim() === '',
    );
    if (hasHalfEmpty) {
      setErrorMessage('Telemetry option key and value both are required.');
      return false;
    }

    const keys = nonEmpty.map(opt => opt.key.trim().toLowerCase());
    if (new Set(keys).size !== keys.length) {
      setErrorMessage('Duplicate telemetry option keys are not allowed.');
      return false;
    }

    const providerConfig = providerConfigByCode.get(providerType) || [];
    const endpointRequired = providerConfig.some(
      cfg => cfg.name === 'endpoint',
    );

    if (endpointRequired) {
      const endpoint = nonEmpty.find(
        opt => opt.key.trim().toLowerCase() === 'endpoint',
      );
      if (!endpoint || endpoint.value.trim() === '') {
        setErrorMessage('This provider requires an `endpoint` option.');
        return false;
      }
    }

    return true;
  };

  const onSubmit = () => {
    if (!validate()) return;

    showLoader();
    CreateAssistantTelemetryProvider(
      connectionConfig,
      assistantId,
      providerType,
      enabled,
      buildMetadata(),
      (err, response) => {
        hideLoader();
        if (err) {
          setErrorMessage(
            'Unable to create assistant telemetry provider, please try again.',
          );
          return;
        }

        if (response?.getSuccess()) {
          toast.success('Assistant telemetry provider created successfully');
          navigator.goToAssistantTelemetry(assistantId);
          return;
        }

        const message = response?.getError()?.getHumanmessage();
        setErrorMessage(
          message ||
            'Unable to create assistant telemetry provider, please try again.',
        );
      },
      {
        'x-auth-id': authId,
        authorization: token,
        'x-project-id': projectId,
      },
    );
  };

  return (
    <>
      <ConfirmDialogComponent />
      <div className="h-full flex flex-col bg-white dark:bg-gray-900 overflow-auto">
        <div className="px-8 pt-8 pb-6 max-w-4xl w-full flex flex-col gap-8">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Create telemetry provider
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure telemetry destination for this assistant.
            </p>
          </div>

          <FieldSet>
            <FormLabel>Provider type</FormLabel>
            <Select
              value={providerType}
              onChange={e => setProviderType(e.target.value)}
              options={providerOptions}
            />
          </FieldSet>

          <FieldSet>
            <InputCheckbox
              checked={enabled}
              onChange={e => setEnabled(e.target.checked)}
            >
              Enable this telemetry provider
            </InputCheckbox>
            <InputHelper>
              Disabled providers are saved but not used by the assistant.
            </InputHelper>
          </FieldSet>

          <FieldSet>
            <div className="flex items-center justify-between">
              <FormLabel>Options</FormLabel>
              <IBlueBorderButton
                className="!h-9"
                type="button"
                onClick={() => setOptions(prev => [...prev, { key: '', value: '' }])}
              >
                Add option <Plus className="w-4 h-4" strokeWidth={1.5} />
              </IBlueBorderButton>
            </div>
            <div className="border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800">
              {options.map((opt, index) => (
                <div key={index} className="grid grid-cols-12">
                  <div className="col-span-4 border-r border-gray-200 dark:border-gray-800">
                    <Input
                      value={opt.key}
                      onChange={e => updateOption(index, 'key', e.target.value)}
                      placeholder="key (e.g. endpoint)"
                      className="border-none"
                    />
                  </div>
                  <div className="col-span-7 border-r border-gray-200 dark:border-gray-800">
                    <Input
                      value={opt.value}
                      onChange={e => updateOption(index, 'value', e.target.value)}
                      placeholder="value"
                      className="border-none"
                    />
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <IRedBorderButton
                      className="border-none h-10"
                      onClick={() =>
                        setOptions(prev => prev.filter((_, i) => i !== index))
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </IRedBorderButton>
                  </div>
                </div>
              ))}
            </div>
            <InputHelper>
              Example keys: endpoint, headers, insecure, service_name.
            </InputHelper>
          </FieldSet>

          {errorMessage && (
            <div className="text-sm text-rose-600 dark:text-rose-400">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <ICancelButton
              type="button"
              onClick={() => showDialog(navigator.goBack)}
            >
              Cancel
            </ICancelButton>
            <IBlueBGArrowButton type="button" onClick={onSubmit}>
              Save telemetry
            </IBlueBGArrowButton>
          </div>
        </div>
      </div>
    </>
  );
};
