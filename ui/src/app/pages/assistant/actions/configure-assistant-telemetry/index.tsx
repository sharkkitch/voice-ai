import React, { FC, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGlobalNavigation } from '@/hooks/use-global-navigator';
import { toHumanReadableDateTime } from '@/utils/date';
import { Plus, RotateCw } from 'lucide-react';
import { useCurrentCredential } from '@/hooks/use-credential';
import { useRapidaStore } from '@/hooks';
import { SectionLoader } from '@/app/components/loader/section-loader';
import { BluredWrapper } from '@/app/components/wrapper/blured-wrapper';
import { SearchIconInput } from '@/app/components/form/input/IconInput';
import { TablePagination } from '@/app/components/base/tables/table-pagination';
import { TableSection } from '@/app/components/sections/table-section';
import { ScrollableResizableTable } from '@/app/components/data-table';
import { TableRow } from '@/app/components/base/tables/table-row';
import { TableCell } from '@/app/components/base/tables/table-cell';
import { IButton } from '@/app/components/form/button';
import toast from 'react-hot-toast/headless';
import { CardOptionMenu } from '@/app/components/menu';
import { ActionableEmptyMessage } from '@/app/components/container/message/actionable-empty-message';
import { PaginationButtonBlock } from '@/app/components/blocks/pagination-button-block';
import { cn } from '@/utils';
import { CreateAssistantTelemetry } from './create-assistant-telemetry';
import { UpdateAssistantTelemetry } from './update-assistant-telemetry';
import { useAssistantTelemetryPageStore } from '@/app/pages/assistant/actions/store/use-telemetry-page-store';
import { useConfirmDialog } from '@/app/pages/assistant/actions/hooks/use-confirmation';

export function ConfigureAssistantTelemetryPage() {
  const { assistantId } = useParams();
  return <>{assistantId && <ConfigureAssistantTelemetry assistantId={assistantId} />}</>;
}

export function CreateAssistantTelemetryPage() {
  const { assistantId } = useParams();
  return <>{assistantId && <CreateAssistantTelemetry assistantId={assistantId} />}</>;
}

export function UpdateAssistantTelemetryPage() {
  const { assistantId } = useParams();
  return <>{assistantId && <UpdateAssistantTelemetry assistantId={assistantId} />}</>;
}

const ConfigureAssistantTelemetry: FC<{ assistantId: string }> = ({
  assistantId,
}) => {
  const navigation = useGlobalNavigation();
  const action = useAssistantTelemetryPageStore();
  const { authId, token, projectId } = useCurrentCredential();
  const { loading, showLoader, hideLoader } = useRapidaStore();
  const { showDialog, ConfirmDialogComponent } = useConfirmDialog({
    title: 'Delete telemetry?',
    content: 'This telemetry provider will be removed from the assistant.',
  });

  useEffect(() => {
    showLoader('block');
    get();
  }, []);

  const get = () => {
    action.getAssistantTelemetry(
      assistantId,
      projectId,
      token,
      authId,
      e => {
        toast.error(e);
        hideLoader();
      },
      () => {
        hideLoader();
      },
    );
  };

  const deleteTelemetry = (telemetryId: string) => {
    showLoader('block');
    action.deleteAssistantTelemetry(
      assistantId,
      telemetryId,
      projectId,
      token,
      authId,
      e => {
        toast.error(e);
        hideLoader();
      },
      () => {
        toast.success('Telemetry provider deleted successfully');
        get();
      },
    );
  };

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <SectionLoader />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col flex-1 bg-white dark:bg-gray-900">
      <ConfirmDialogComponent />
      <BluredWrapper className="border-t-0 p-0">
        <div className="flex space-x-2">
          <SearchIconInput className="bg-light-background" />
        </div>
        <PaginationButtonBlock>
          <TablePagination
            className="py-0"
            columns={action.columns}
            currentPage={action.page}
            onChangeCurrentPage={action.setPage}
            totalItem={action.totalCount}
            pageSize={action.pageSize}
            onChangePageSize={action.setPageSize}
            onChangeColumns={action.setColumns}
          />
          <IButton onClick={get}>
            <RotateCw className="w-4 h-4" strokeWidth={1.5} />
          </IButton>
          <button
            type="button"
            onClick={() => navigation.goToCreateAssistantTelemetry(assistantId)}
            className="flex items-center gap-2 px-4 text-sm text-white bg-primary hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            Add telemetry
            <Plus className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </PaginationButtonBlock>
      </BluredWrapper>

      <TableSection>
        {action.telemetries.length > 0 ? (
          <ScrollableResizableTable
            isActionable={false}
            isOptionable={true}
            clms={action.columns.filter(x => x.visible)}
          >
            {action.telemetries.map((row, idx) => (
              <TableRow key={idx} data-id={row.getId()}>
                {action.visibleColumn('id') && (
                  <TableCell>{row.getId()}</TableCell>
                )}

                {action.visibleColumn('providerType') && (
                  <TableCell>{row.getProvidertype()}</TableCell>
                )}

                {action.visibleColumn('enabled') && (
                  <TableCell>
                    <span
                      className={cn(
                        'px-2 py-1 text-xs font-medium uppercase',
                        row.getEnabled()
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : 'bg-gray-500/15 text-gray-700 dark:text-gray-300',
                      )}
                    >
                      {row.getEnabled() ? 'Enabled' : 'Disabled'}
                    </span>
                  </TableCell>
                )}

                {action.visibleColumn('options') && (
                  <TableCell>{row.getOptionsList().length}</TableCell>
                )}

                {action.visibleColumn('createdDate') && (
                  <TableCell>
                    {row.getCreateddate() &&
                      toHumanReadableDateTime(row.getCreateddate()!)}
                  </TableCell>
                )}

                <TableCell>
                  <CardOptionMenu
                    classNames={cn('w-9 h-9')}
                    options={[
                      {
                        option: (
                          <div className="flex items-center text-sm">
                            <span>Edit telemetry</span>
                          </div>
                        ),
                        onActionClick: () => {
                          navigation.goToEditAssistantTelemetry(
                            assistantId,
                            row.getId(),
                          );
                        },
                      },
                      {
                        option: (
                          <div className="flex items-center text-sm justify-between">
                            <span>Delete telemetry</span>
                          </div>
                        ),
                        onActionClick: () => {
                          showDialog(() => deleteTelemetry(row.getId()));
                        },
                      },
                    ]}
                  />
                </TableCell>
              </TableRow>
            ))}
          </ScrollableResizableTable>
        ) : (
          <ActionableEmptyMessage
            centered
            title="No Telemetry"
            subtitle="There are no assistant telemetry providers found."
            action="Add telemetry"
            onActionClick={() =>
              navigation.goToCreateAssistantTelemetry(assistantId)
            }
          />
        )}
      </TableSection>
    </div>
  );
};
