import { PageHeaderBlock } from '@/app/components/blocks/page-header-block';
import { PageTitleBlock } from '@/app/components/blocks/page-title-block';
import { PlayIcon } from '@/app/components/Icon/Play';
import { Spinner } from '@/app/components/loader/spinner';
import { FC } from 'react';

export const PlaygroundHeader: FC<{
  isValid: boolean;
  loading: boolean;
}> = ({ isValid, loading }) => {
  return (
    <PageHeaderBlock>
      <PageTitleBlock>Playground</PageTitleBlock>
      <div className="flex items-stretch h-12 border-l border-gray-200 dark:border-gray-800">
        <button
          type="submit"
          className="flex items-center gap-2 px-4 text-sm text-white bg-primary hover:bg-primary/90 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          Try execute
          {!loading && <PlayIcon className="w-4 h-4" strokeWidth={1.5} />}
          {loading && <Spinner className="w-4 h-4 border-white" />}
        </button>
      </div>
    </PageHeaderBlock>
  );
};
