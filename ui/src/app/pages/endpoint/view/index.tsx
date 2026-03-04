import { Endpoint } from '@rapidaai/react';
import { Helmet } from '@/app/components/helmet';
import { useEndpointPageStore, useRapidaStore } from '@/hooks';
import { useCredential } from '@/hooks/use-credential';
import { useCallback, useEffect } from 'react';
import toast from 'react-hot-toast/headless';
import { Tab } from '@/app/components/tab';
import { Version } from '@/app/pages/endpoint/view/version-list';
import { toHumanReadableRelativeTime } from '@/utils/date';
import { cn } from '@/utils';
import { Playground } from '@/app/pages/endpoint/view/try-playground';
import { EndpointInstructionDialog } from '@/app/components/base/modal/endpoint-instruction-modal';
import { CreateTagDialog } from '@/app/components/base/modal/create-tag-modal';
import { Tag } from '@rapidaai/react';
import { EndpointAction } from '@/app/pages/endpoint/view/endpoint-action';
import { useParams } from 'react-router-dom';
import { UpdateDescriptionDialog } from '@/app/components/base/modal/update-description-modal';
import { EndpointTag } from '@/app/components/form/tag-input/endpoint-tags';
import { PageHeaderBlock } from '@/app/components/blocks/page-header-block';
import { PageTitleBlock } from '@/app/components/blocks/page-title-block';
import { EndpointTraces } from '@/app/pages/endpoint/view/traces';

/**
 *
 * @returns
 */
export function ViewEndpointPage() {
  /**
   *
   */
  const [userId, token, projectId] = useCredential();

  /**
   *
   */
  const { showLoader, hideLoader } = useRapidaStore();

  /**
   *
   */
  const {
    currentEndpoint,
    onChangeCurrentEndpoint,
    onChangeCurrentEndpointProviderModel,
    instructionVisible,
    onHideInstruction,
    currentEndpointProviderModel,
    editTagVisible,
    onHideEditTagVisible,
    onCreateEndpointTag,
    onGetEndpoint,
    updateDetailVisible,
    onHideUpdateDetailVisible,
    onUpdateEndpointDetail,
  } = useEndpointPageStore();

  /**
   * get all the models when type change
   */

  const { endpointId, endpointProviderId } = useParams();

  const onError = useCallback(
    (err: string) => {
      hideLoader();
      toast.error(err);
    },
    [endpointId, endpointProviderId],
  );

  const onSuccess = useCallback(
    (data: Endpoint) => {
      onChangeCurrentEndpoint(data);
      const endpointProviderModel = data.getEndpointprovidermodel();
      if (endpointProviderModel)
        onChangeCurrentEndpointProviderModel(endpointProviderModel);
      hideLoader();
    },
    [endpointId, endpointProviderId],
  );

  const onReload = useCallback(() => {
    if (endpointId) {
      showLoader('overlay');
      onGetEndpoint(
        endpointId,
        endpointProviderId ? endpointProviderId : null,
        projectId,
        token,
        userId,
        onError,
        onSuccess,
      );
    }
  }, []);

  useEffect(() => {
    onReload();
  }, [endpointId, endpointProviderId]);

  return (
    <div className="h-full flex flex-col overflow-auto flex-1">
      <EndpointInstructionDialog
        className="w-1/2"
        modalOpen={instructionVisible}
        setModalOpen={onHideInstruction}
        currentEndpoint={currentEndpoint}
        currentEndpointProviderModel={currentEndpointProviderModel}
      />

      <UpdateDescriptionDialog
        title="Edit details"
        name={currentEndpoint?.getName()}
        modalOpen={updateDetailVisible}
        setModalOpen={onHideUpdateDetailVisible}
        description={currentEndpoint?.getDescription()}
        onUpdateDescription={(
          name: string,
          description: string,
          onError: (err: string) => void,
          onSuccess: () => void,
        ) => {
          let wId = currentEndpoint?.getId();
          if (!wId) {
            onError('Knowledge is undefined, please try again later.');
            return;
          }
          onUpdateEndpointDetail(
            wId,
            name,
            description,
            projectId,
            token,
            userId,
            onError,
            w => {
              onSuccess();
            },
          );
        }}
      />

      <CreateTagDialog
        title="Edit tags"
        tags={currentEndpoint?.getEndpointtag()?.getTagList()}
        modalOpen={editTagVisible}
        allTags={EndpointTag}
        setModalOpen={onHideEditTagVisible}
        onCreateTag={(
          tags: string[],
          onError: (err: string) => void,
          onSuccess: (e: Tag) => void,
        ) => {
          let wId = currentEndpoint?.getId();
          if (!wId) {
            onError(
              'Endpoint is undefined, please provide a valid endpoint id.',
            );
            return;
          }
          onCreateEndpointTag(
            wId,
            tags,
            projectId,
            token,
            userId,
            onError,
            endpoint => {
              let tags = endpoint.getEndpointtag();
              if (tags) onSuccess(tags);
            },
          );
        }}
      />

      <Helmet title="Hosted endpoints" />
      <PageHeaderBlock>
        <div className="flex items-center gap-3">
          <PageTitleBlock>
            <span className="text-gray-400 dark:text-gray-500 font-normal">
              Endpoint
            </span>
            <span className="px-2 text-gray-300 dark:text-gray-600">/</span>
            {currentEndpoint?.getName()}
          </PageTitleBlock>
          {currentEndpoint?.getEndpointprovidermodel()?.getCreateddate() && (
            <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
              {toHumanReadableRelativeTime(
                currentEndpoint.getEndpointprovidermodel()?.getCreateddate()!,
              )}
            </span>
          )}
        </div>
        {currentEndpoint && (
          <EndpointAction currentEndpoint={currentEndpoint} />
        )}
      </PageHeaderBlock>

      {currentEndpointProviderModel && currentEndpoint && (
        <Tab
          strict
          active="overview"
          className={cn('sticky top-0 z-1', 'bg-white dark:bg-gray-900')}
          tabs={[
            {
              label: 'overview',
              element: (
                <Playground
                  currentEndpoint={currentEndpoint}
                  currentEndpointProviderModel={currentEndpointProviderModel}
                />
              ),
            },
            {
              label: 'Traces',
              element: <EndpointTraces currentEndpoint={currentEndpoint} />,
            },
            {
              label: 'versions',
              element: (
                <Version
                  currentEndpoint={currentEndpoint}
                  onReload={onReload}
                />
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
