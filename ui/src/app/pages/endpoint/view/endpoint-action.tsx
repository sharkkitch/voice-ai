import { FC } from 'react';
import { Endpoint } from '@rapidaai/react';
import { useNavigate } from 'react-router-dom';
import { useResourceRole } from '@/hooks/use-credential';
import { isOwnerResource } from '@/utils';
import { Plus } from 'lucide-react';
import { EndpointOptions } from '@/app/pages/endpoint/view/endpoint-option';

/**
 *
 * @param param0
 * @returns
 */
export const EndpointAction: FC<{ currentEndpoint: Endpoint }> = ({
  currentEndpoint,
}) => {
  /**
   * element
   */
  const role = useResourceRole(currentEndpoint);

  /**
   * element
   */
  if (isOwnerResource(role)) {
    return <OwnerAction currentEndpoint={currentEndpoint} />;
  }
  return <div />;
};

/**
 *
 * actions for the owner of assistant
 * @param param0
 * @returns
 */
const OwnerAction: FC<{ currentEndpoint: Endpoint }> = ({
  currentEndpoint,
}) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-stretch h-12 border-l border-gray-200 dark:border-gray-800">
      {/* Options overflow menu */}
      <div className="border-r border-gray-200 dark:border-gray-800 flex items-stretch">
        <EndpointOptions endpoint={currentEndpoint} />
      </div>
      {/* Primary CTA */}
      {currentEndpoint != null && (
        <button
          type="button"
          className="flex items-center gap-2 px-4 text-sm text-white bg-primary hover:bg-primary/90 transition-colors whitespace-nowrap"
          onClick={() =>
            navigate(
              `/deployment/endpoint/${currentEndpoint?.getId()}/create-endpoint-version`,
            )
          }
        >
          Create new version
          <Plus strokeWidth={1.5} className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
