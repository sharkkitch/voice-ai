import React, { FC, useState } from 'react';
import { IBlueBGButton, ICancelButton } from '@/app/components/form/button';
import { GenericModal, ModalProps } from '@/app/components/base/modal';
import { ModalFitHeightBlock } from '@/app/components/blocks/modal-fit-height-block';
import { ModalHeader } from '@/app/components/base/modal/modal-header';
import { ModalTitleBlock } from '@/app/components/blocks/modal-title-block';
import { ModalBody } from '@/app/components/base/modal/modal-body';
import { ModalFooter } from '@/app/components/base/modal/modal-footer';
import { cn } from '@/utils';
import endpointTemplates from '@/prompts/endpoints/index.json';
import { Check } from 'lucide-react';
import { CornerBorderOverlay } from '@/app/components/base/corner-border';

interface EndpointTemplate {
  name: string;
  description: string;
  provider: string;
  model: string;
  parameters: {
    temperature: number;
    response_format: string;
  };
  instruction: {
    role: string;
    content: string;
  }[];
}

interface ConfigureEndpointPromptDialogProps extends ModalProps {
  onSelectTemplate?: (template: EndpointTemplate) => void;
}

export const ConfigureEndpointPromptDialog: FC<
  ConfigureEndpointPromptDialogProps
> = props => {
  const [selectedTemplate, setSelectedTemplate] =
    useState<EndpointTemplate | null>(null);

  const handleContinue = () => {
    if (selectedTemplate && props.onSelectTemplate) {
      props.onSelectTemplate(selectedTemplate);
    }
    props.setModalOpen(false);
  };

  return (
    <GenericModal
      modalOpen={props.modalOpen}
      setModalOpen={props.setModalOpen}
    >
      <ModalFitHeightBlock
        className="w-[900px] flex flex-col items-stretch"
        style={{ maxHeight: '85vh' }}
      >
        <ModalHeader onClose={() => props.setModalOpen(false)}>
          <ModalTitleBlock>Select a usecase template</ModalTitleBlock>
        </ModalHeader>

        {/* Context bar */}
        <div className="shrink-0 px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Choose a pre-configured template to auto-fill your model, prompt,
            and parameters. You can customise everything after selecting.
          </p>
        </div>

        {/* Scrollable tile grid */}
        <ModalBody className="flex-1 min-h-0 overflow-y-auto px-6 py-6 gap-0">
          <div className="grid grid-cols-2 border-l border-t border-gray-200 dark:border-gray-800">
            {(endpointTemplates as EndpointTemplate[]).map((template, index) => {
              const isSelected = selectedTemplate?.name === template.name;
              return (
                <div
                  key={index}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedTemplate(template)}
                  onKeyDown={e =>
                    (e.key === 'Enter' || e.key === ' ') &&
                    setSelectedTemplate(template)
                  }
                  className={cn(
                    'relative flex flex-col p-4 border-r border-b border-gray-200 dark:border-gray-800 cursor-pointer transition-colors duration-100 select-none outline-none group',
                    'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
                    isSelected
                      ? 'bg-primary/5 dark:bg-primary/10'
                      : 'bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800',
                  )}
                >
                  {/* Corner accent brackets — always visible when selected, appear on hover otherwise */}
                  <CornerBorderOverlay className={isSelected ? 'opacity-100' : undefined} />

                  {/* Carbon checkmark — top-right square badge, above corner accents */}
                  <div
                    className={cn(
                      'absolute top-0 right-0 w-6 h-6 flex items-center justify-center transition-colors duration-100 z-20',
                      isSelected ? 'bg-primary' : 'bg-transparent',
                    )}
                  >
                    {isSelected && (
                      <Check
                        className="w-3.5 h-3.5 text-white"
                        strokeWidth={2.5}
                      />
                    )}
                  </div>

                  {/* Template name */}
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug mb-1.5 pr-6">
                    {template.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-4 flex-1">
                    {template.description}
                  </p>

                  {/* Metadata tags — Carbon neutral */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-[0.06em] uppercase bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {template.provider}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {template.model}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500">
                      Temp&nbsp;{template.parameters.temperature}
                    </span>
                    {template.parameters.response_format && (
                      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500">
                        JSON
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ModalBody>

        <ModalFooter>
          <ICancelButton onClick={() => props.setModalOpen(false)}>
            Cancel
          </ICancelButton>
          <IBlueBGButton
            type="button"
            disabled={!selectedTemplate}
            onClick={handleContinue}
          >
            Use template
          </IBlueBGButton>
        </ModalFooter>
      </ModalFitHeightBlock>
    </GenericModal>
  );
};
