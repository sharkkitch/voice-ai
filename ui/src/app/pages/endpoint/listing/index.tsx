import { useEffect, useCallback, useState } from 'react';
import { SingleEndpoint } from './single-endpoint';
import { useCredential } from '@/hooks/use-credential';
import { TablePagination } from '@/app/components/base/tables/table-pagination';
import { SearchIconInput } from '@/app/components/form/input/IconInput';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEndpointPageStore } from '@/hooks';
import { Helmet } from '@/app/components/helmet';
import { BluredWrapper } from '@/app/components/wrapper/blured-wrapper';
import { Endpoint } from '@rapidaai/react';
import toast from 'react-hot-toast/headless';
import { useRapidaStore } from '@/hooks';
import { Spinner } from '@/app/components/loader/spinner';
import { HowEndpointWorksDialog } from '@/app/components/base/modal/how-it-works-modal/how-endpoint-works';
import { ActionableEmptyMessage } from '@/app/components/container/message/actionable-empty-message';
import { IButton } from '@/app/components/form/button';
import { Plus, RotateCw } from 'lucide-react';
import { PageHeaderBlock } from '@/app/components/blocks/page-header-block';
import { PageTitleBlock } from '@/app/components/blocks/page-title-block';
import { ScrollableResizableTable } from '@/app/components/data-table';
import { PaginationButtonBlock } from '@/app/components/blocks/pagination-button-block';

/**
 *
 * @returns
 */
export function EndpointPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userId, token, projectId] = useCredential();
  const endpointActions = useEndpointPageStore();
  const { loading, showLoader, hideLoader } = useRapidaStore();
  const navigator = useNavigate();

  /**
   *
   */
  useEffect(() => {
    if (searchParams) {
      const searchParamMap = Object.fromEntries(searchParams.entries());
      Object.entries(searchParamMap).forEach(([key, value]) =>
        endpointActions.addCriteria(key, value, '='),
      );
    }
  }, [searchParams]);

  const onError = useCallback((err: string) => {
    hideLoader();
    toast.error(err);
  }, []);

  const onSuccess = useCallback((data: Endpoint[]) => {
    hideLoader();
  }, []);
  /**
   * call the api
   */
  const getEndpoints = useCallback((projectId, token, userId) => {
    showLoader();
    endpointActions.onGetAllEndpoint(
      projectId,
      token,
      userId,
      onError,
      onSuccess,
    );
  }, []);

  /**
   *
   */
  useEffect(() => {
    getEndpoints(projectId, token, userId);
  }, [
    projectId,
    endpointActions.page,
    endpointActions.pageSize,
    endpointActions.criteria,
  ]);

  const [hiw, sethiw] = useState(false);
  return (
    <div className="h-full flex flex-col overflow-auto flex-1">
      <Helmet title="Hosted endpoints" />
      <HowEndpointWorksDialog setModalOpen={sethiw} modalOpen={hiw} />

      <PageHeaderBlock>
        <div className="flex items-center gap-3">
          <PageTitleBlock>Hosted Endpoints</PageTitleBlock>
          <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
            {endpointActions.endpoints.length}/{endpointActions.totalCount}
          </span>
        </div>

        {/* ── Header actions — Carbon UI shell toolbar pattern ── */}
        <div className="flex items-stretch h-12 border-l border-gray-200 dark:border-gray-800">
          {/* Ghost action */}
          <button
            type="button"
            onClick={() => sethiw(!hiw)}
            className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border-r border-gray-200 dark:border-gray-800 transition-colors whitespace-nowrap"
          >
            How it works?
          </button>

          {/* Primary CTA */}
          <button
            type="button"
            className="flex items-center gap-2 px-4 text-sm text-white bg-primary hover:bg-primary/90 transition-colors whitespace-nowrap"
            onClick={() => navigate('/deployment/endpoint/create-endpoint')}
          >
            Add new endpoint
            <Plus strokeWidth={1.5} className="w-4 h-4" />
          </button>
        </div>
      </PageHeaderBlock>

      {/* Toolbar: search + pagination */}
      <BluredWrapper className="sticky top-0 z-11">
        <SearchIconInput className="bg-light-background flex-1" />
        <PaginationButtonBlock className="shrink-0">
          <TablePagination
            columns={endpointActions.columns}
            currentPage={endpointActions.page}
            onChangeCurrentPage={endpointActions.setPage}
            totalItem={endpointActions.totalCount}
            pageSize={endpointActions.pageSize}
            onChangePageSize={endpointActions.setPageSize}
            onChangeColumns={endpointActions.setColumns}
          />
          <IButton onClick={() => getEndpoints(projectId, token, userId)}>
            <RotateCw strokeWidth={1.5} className="h-4 w-4" />
          </IButton>
        </PaginationButtonBlock>
      </BluredWrapper>

      {/* Content */}
      {endpointActions.endpoints && endpointActions.endpoints.length > 0 ? (
        <ScrollableResizableTable
          isActionable={false}
          optionLabel="Action"
          clms={endpointActions.columns.filter(x => x.visible)}
        >
          {endpointActions.endpoints.map(ed => (
            <SingleEndpoint key={`endpoint_row_${ed.getId()}`} endpoint={ed} />
          ))}
        </ScrollableResizableTable>
      ) : endpointActions.criteria.length > 0 ? (
        <div className="h-full flex justify-center items-center">
          <ActionableEmptyMessage
            title="No Endpoint"
            subtitle="There are no endpoints matching with your criteria to display"
            action="Create new endpoint"
            onActionClick={() =>
              navigator('/deployment/endpoint/create-endpoint')
            }
          />
        </div>
      ) : !loading ? (
        <div className="h-full flex justify-center items-center">
          <ActionableEmptyMessage
            title="No Endpoint"
            subtitle="There are no endpoints deployed to display"
            action="Create new endpoint"
            onActionClick={() =>
              navigator('/deployment/endpoint/create-endpoint')
            }
          />
        </div>
      ) : (
        <div className="h-full flex justify-center items-center">
          <Spinner size="md" />
        </div>
      )}
    </div>
  );
}
