import { GenericModal, ModalProps } from '@/app/components/base/modal';
import { FC, HTMLAttributes, memo } from 'react';
import { ModalHeader } from '@/app/components/base/modal/modal-header';
import { ModalFitHeightBlock } from '@/app/components/blocks/modal-fit-height-block';
import { CheckCircle, ExternalLink } from 'lucide-react';
import { ModalBody } from '@/app/components/base/modal/modal-body';
import { ModalFooter } from '@/app/components/base/modal/modal-footer';
import { ICancelButton, ILinkButton } from '@/app/components/form/button';
import { CodeHighlighting } from '@/app/components/code-highlighting';
import { DeploymentSectionHeader } from '@/app/components/base/modal/deployment-modal-primitives';

interface AssistantInstructionDialogProps
  extends ModalProps,
    HTMLAttributes<HTMLDivElement> {
  assistantId: string;
}

export const AssistantWebwidgetDeploymentDialog: FC<AssistantInstructionDialogProps> =
  memo(({ assistantId, ...mldAttr }) => {
    return (
      <GenericModal {...mldAttr}>
        <ModalFitHeightBlock className="w-[720px]">
          <ModalHeader
            onClose={() => {
              mldAttr.setModalOpen(false);
            }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Deployment completed
              </span>
            </div>
          </ModalHeader>

          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your assistant has been deployed. Add the following snippets to
              your website to start receiving messages.
            </p>
          </div>

          <ModalBody className="gap-0 !p-0">
            <DeploymentSectionHeader label="1. Add script to your HTML" />
            <div className="px-4 py-3">
              <CodeHighlighting
                className="min-h-[20px]"
                code='<script src="https://cdn-01.rapida.ai/public/scripts/app.min.js" defer></script>'
              />
            </div>

            <DeploymentSectionHeader label="2. Initialize the assistant" />
            <div className="px-4 py-3">
              <CodeHighlighting
                className="min-h-[240px]"
                code={`<script>
window.chatbotConfig = {
  assistant_id: "${assistantId}",
  token: "{RAPIDA_PROJECT_KEY}",
  user: {
    id: "{UNIQUE_IDENTIFIER}",
    name: "{NAME}",
  },
  layout: "docked-right",
  position: "bottom-right",
  showLauncher: true,
  name: "Rapida Assistant",
  theme: {
    mode: "light",
  },
};
</script>`}
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <ICancelButton onClick={() => mldAttr.setModalOpen(false)}>
              Close
            </ICancelButton>
            <ILinkButton href="https://doc.rapida.ai" target="_blank">
              View Documentation
              <ExternalLink className="w-4 h-4 ml-2" strokeWidth={1.5} />
            </ILinkButton>
          </ModalFooter>
        </ModalFitHeightBlock>
      </GenericModal>
    );
  });
