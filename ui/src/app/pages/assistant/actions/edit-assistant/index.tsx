import {
  AssistantDefinition,
  ConnectionConfig,
  DeleteAssistant,
  GetAssistant,
  GetAssistantRequest,
} from '@rapidaai/react';
import { GetAssistantResponse } from '@rapidaai/react';
import { ServiceError } from '@rapidaai/react';
import { PageHeaderBlock } from '@/app/components/blocks/page-header-block';
import { PageTitleBlock } from '@/app/components/blocks/page-title-block';
import { ErrorContainer } from '@/app/components/error-container';
import { FormLabel } from '@/app/components/form-label';
import { IBlueBGButton, IRedBGButton } from '@/app/components/form/button';
import { FieldSet } from '@/app/components/form/fieldset';
import { Input } from '@/app/components/form/input';
import { CopyInput } from '@/app/components/form/input/copy-input';
import { Textarea } from '@/app/components/form/textarea';
import { InputHelper } from '@/app/components/input-helper';
import { useDeleteConfirmDialog } from '@/app/pages/assistant/actions/hooks/use-delete-confirmation';
import { useRapidaStore } from '@/hooks';
import { useCurrentCredential } from '@/hooks/use-credential';
import { useGlobalNavigation } from '@/hooks/use-global-navigator';
import { AlertTriangle } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import toast from 'react-hot-toast/headless';
import { useParams } from 'react-router-dom';
import { UpdateAssistantDetail } from '@rapidaai/react';
import { connectionConfig } from '@/configs';
import { ErrorMessage } from '@/app/components/form/error-message';

export function EditAssistantPage() {
  const { assistantId } = useParams();
  const { goToAssistantListing } = useGlobalNavigation();

  if (!assistantId)
    return (
      <div className="flex flex-1">
        <ErrorContainer
          onAction={goToAssistantListing}
          code="403"
          actionLabel="Go to listing"
          title="Assistant not available"
          description="This assistant may be archived or you don't have access to it. Please check with your administrator or try another assistant."
        />
      </div>
    );

  return <EditAssistant assistantId={assistantId!} />;
}

export const EditAssistant: FC<{ assistantId: string }> = ({ assistantId }) => {
  const { authId, token, projectId } = useCurrentCredential();
  const { loading, showLoader, hideLoader } = useRapidaStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { goToAssistantListing } = useGlobalNavigation();

  useEffect(() => {
    showLoader('block');

    const request = new GetAssistantRequest();
    const assistantDef = new AssistantDefinition();
    assistantDef.setAssistantid(assistantId);
    request.setAssistantdefinition(assistantDef);
    GetAssistant(
      connectionConfig,
      request,
      ConnectionConfig.WithDebugger({
        authorization: token,
        userId: authId,
        projectId: projectId,
      }),
    )
      .then(car => {
        hideLoader();
        if (car?.getSuccess()) {
          const assistant = car.getData();
          if (assistant) {
            setName(assistant.getName());
            setDescription(assistant.getDescription());
          }
        } else {
          const error = car?.getError();
          if (error) {
            toast.error(error.getHumanmessage());
            return;
          }
          toast.error('Unable to delete assistant. please try again later.');
          return;
        }
      })
      .catch(err => {
        hideLoader();
      });
  }, [assistantId]);

  const onUpdateAssistantDetail = () => {
    showLoader('block');
    const afterUpdateAssistant = (
      err: ServiceError | null,
      car: GetAssistantResponse | null,
    ) => {
      hideLoader();
      if (car?.getSuccess()) {
        toast.success('The assistant has been successfully updated.');
        const assistant = car.getData();
        if (assistant) {
          setName(assistant.getName());
          setDescription(assistant.getDescription());
        }
      } else {
        const error = car?.getError();
        if (error) {
          setErrorMessage(error.getHumanmessage());
          return;
        }
        setErrorMessage('Unable to update assistant. please try again later.');
        return;
      }
    };
    UpdateAssistantDetail(
      connectionConfig,
      assistantId,
      name,
      description,
      afterUpdateAssistant,
      {
        authorization: token,
        'x-auth-id': authId,
        'x-project-id': projectId,
      },
    );
  };

  const Deletion = useDeleteConfirmDialog({
    onConfirm: () => {
      showLoader('block');
      const afterDeleteAssistant = (
        err: ServiceError | null,
        car: GetAssistantResponse | null,
      ) => {
        if (car?.getSuccess()) {
          toast.error('The assistant has been deleted successfully.');
          goToAssistantListing();
        } else {
          const error = car?.getError();
          if (error) {
            toast.error(error.getHumanmessage());
            return;
          }
          toast.error('Unable to delete assistant. please try again later.');
          return;
        }
      };

      DeleteAssistant(connectionConfig, assistantId, afterDeleteAssistant, {
        authorization: token,
        'x-auth-id': authId,
        'x-project-id': projectId,
      });
    },
    name: name,
  });

  return (
    <div className="w-full flex flex-col flex-1">
      <Deletion.ConfirmDeleteDialogComponent />
      <PageHeaderBlock>
        <PageTitleBlock>General Settings</PageTitleBlock>
      </PageHeaderBlock>

      <div className="overflow-auto flex flex-col flex-1 bg-white dark:bg-gray-900">
        {/* Assistant Identity */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-2xl mb-4 space-y-1">
            <h2 className="text-sm font-semibold">Assistant Identity</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your assistant's unique identifier. This cannot be changed.
            </p>
          </div>
          <FieldSet className="max-w-md">
            <FormLabel>Assistant ID</FormLabel>
            <CopyInput
              name="id"
              disabled
              value={assistantId}
              className="bg-white dark:bg-gray-900 border-dashed"
              placeholder="eg: your emotion detector"
            />
          </FieldSet>
        </div>

        {/* General Information */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 space-y-5">
          <div className="max-w-2xl space-y-1">
            <h2 className="text-sm font-semibold">General Information</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Update your assistant's display name and purpose description.
            </p>
          </div>
          <FieldSet>
            <FormLabel>Name</FormLabel>
            <Input
              name="usecase"
              className="max-w-md"
              onChange={e => {
                setName(e.target.value);
              }}
              value={name}
              placeholder="eg: your emotion detector"
            />
          </FieldSet>
          <FieldSet className="col-span-2">
            <FormLabel>Description</FormLabel>
            <Textarea
              row={5}
              className="max-w-xl"
              value={description}
              placeholder={"What's the purpose of the assistant?"}
              onChange={t => setDescription(t.target.value)}
            />
          </FieldSet>
          <ErrorMessage message={errorMessage} />
          <IBlueBGButton
            type="button"
            isLoading={loading}
            onClick={onUpdateAssistantDetail}
            className="px-4"
          >
            Update Assistant
          </IBlueBGButton>
        </div>

        {/* Danger Zone */}
        <div className="p-5">
          <div className="max-w-2xl border border-red-200 dark:border-red-900/50 overflow-hidden">
            <div className="px-4 py-3 bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-900/50">
              <h2 className="text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" strokeWidth={1.5} />
                Danger Zone
              </h2>
            </div>
            <div className="p-4 flex flex-row items-start justify-between gap-6">
              <div className="space-y-1.5">
                <p className="text-sm font-semibold">Delete this assistant</p>
                <InputHelper>
                  Once you delete an assistant, there is no going back. Active
                  connections will be terminated immediately, and the data will
                  be permanently deleted after the rolling period.
                </InputHelper>
              </div>
              <IRedBGButton
                className="shrink-0"
                isLoading={loading}
                onClick={Deletion.showDialog}
              >
                Delete assistant
              </IRedBGButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
