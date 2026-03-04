import { Endpoint, EndpointProviderModel } from '@rapidaai/react';
import { IButton } from '@/app/components/form/button';
import { useEndpointProviderModelPageStore } from '@/hooks';
import { useRapidaStore } from '@/hooks';
import { useCurrentCredential } from '@/hooks/use-credential';
import React, { useEffect } from 'react';
import toast from 'react-hot-toast/headless';
import { toHumanReadableRelativeTime } from '@/utils/date';
import { TextImage } from '@/app/components/text-image';
import { CopyButton } from '@/app/components/form/button/copy-button';
import { RevisionIndicator } from '@/app/components/indicators/revision';
import { Rocket, RotateCw } from 'lucide-react';
import { BluredWrapper } from '@/app/components/wrapper/blured-wrapper';
import { YellowNoticeBlock } from '@/app/components/container/message/notice-block';
import TooltipPlus from '@/app/components/base/tooltip-plus';
import { ScrollableResizableTable } from '@/app/components/data-table';
import { TableRow } from '@/app/components/base/tables/table-row';
import { TableCell } from '@/app/components/base/tables/table-cell';

const TABLE_COLUMNS = [
  { name: 'Description', key: 'description' },
  { name: 'Version', key: 'version' },
  { name: 'Status', key: 'status' },
  { name: 'Created by', key: 'created_by' },
  { name: 'Date', key: 'date' },
  { name: 'Action', key: 'action' },
];

export function Version(props: {
  currentEndpoint: Endpoint;
  onReload: () => void;
}) {
  const { authId, token, projectId } = useCurrentCredential();
  const rapidaContext = useRapidaStore();
  const endpointProviderAction = useEndpointProviderModelPageStore();

  const fetchVersions = () => {
    rapidaContext.showLoader();
    endpointProviderAction.onChangeCurrentEndpoint(props.currentEndpoint);
    endpointProviderAction.getEndpointProviderModels(
      props.currentEndpoint.getId(),
      projectId,
      token,
      authId,
      (err: string) => {
        rapidaContext.hideLoader();
        toast.error(err);
      },
      (_data: EndpointProviderModel[]) => {
        rapidaContext.hideLoader();
      },
    );
  };

  useEffect(() => {
    fetchVersions();
  }, [
    props.currentEndpoint,
    projectId,
    endpointProviderAction.page,
    endpointProviderAction.pageSize,
    endpointProviderAction.criteria,
  ]);

  const deployRevision = (endpointProviderModelId: string) => {
    rapidaContext.showLoader('overlay');
    endpointProviderAction.onReleaseVersion(
      endpointProviderModelId,
      projectId,
      token,
      authId,
      error => {
        rapidaContext.hideLoader();
        toast.error(error);
      },
      e => {
        toast.success(
          'New version of endpoint has been deployed successfully.',
        );
        endpointProviderAction.onChangeCurrentEndpoint(e);
        props.onReload();
        rapidaContext.hideLoader();
      },
    );
  };

  const versions = endpointProviderAction.endpointProviderModels;

  return (
    <div className="flex flex-col flex-1">
      <BluredWrapper className="p-0">
        <span className="px-4 text-xs font-medium uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">
          {versions.length} version{versions.length !== 1 ? 's' : ''}
        </span>
        <IButton onClick={fetchVersions}>
          <RotateCw strokeWidth={1.5} className="h-4 w-4" />
        </IButton>
      </BluredWrapper>

      {versions.length > 0 ? (
        <ScrollableResizableTable
          isExpandable={false}
          isActionable={false}
          clms={TABLE_COLUMNS}
        >
          {versions.map((epm, idx) => {
            const isDeployed =
              endpointProviderAction.currentEndpoint?.getEndpointprovidermodelid() ===
              epm.getId();
            return (
              <TableRow key={idx}>
                <TableCell>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {epm.getDescription() || 'Initial endpoint version'}
                  </span>
                </TableCell>

                <TableCell>
                  <div className="inline-flex items-center border border-gray-200 dark:border-gray-700 shrink-0">
                    <span className="px-2 py-0.5 font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      vrsn_{epm.getId()}
                    </span>
                    <CopyButton className="border-l h-9 w-9 border-gray-200 dark:border-gray-700">
                      {`vrsn_${epm.getId()}`}
                    </CopyButton>
                  </div>
                </TableCell>

                <TableCell>
                  <RevisionIndicator
                    size="small"
                    status={isDeployed ? 'DEPLOYED' : 'NOT_DEPLOYED'}
                  />
                </TableCell>

                <TableCell>
                  {epm.getCreateduser() && (
                    <div className="flex items-center gap-1.5">
                      <TextImage
                        size={6}
                        name={epm.getCreateduser()?.getName()!}
                      />
                      <span className=" text-gray-600 dark:text-gray-400">
                        {epm.getCreateduser()?.getName()}
                      </span>
                    </div>
                  )}
                </TableCell>

                <TableCell>
                  <span className=" tabular-nums text-gray-500 dark:text-gray-400">
                    {epm.getCreateddate() &&
                      toHumanReadableRelativeTime(epm.getCreateddate()!)}
                  </span>
                </TableCell>

                <TableCell>
                  {!isDeployed && (
                    <div className="flex border border-gray-200 dark:border-gray-800 w-fit">
                      <TooltipPlus
                        className="bg-white dark:bg-gray-950 border-[0.5px] rounded-[2px] px-0 py-0"
                        popupContent={
                          <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                            Deploy this version
                          </div>
                        }
                      >
                        <IButton
                          className="rounded-none"
                          onClick={() => deployRevision(epm.getId())}
                        >
                          <Rocket strokeWidth={1.5} className="h-4 w-4" />
                        </IButton>
                      </TooltipPlus>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </ScrollableResizableTable>
      ) : (
        <YellowNoticeBlock>
          <span className="font-semibold">No versions found</span>, create a new
          version of this endpoint to get started.
        </YellowNoticeBlock>
      )}
    </div>
  );
}
