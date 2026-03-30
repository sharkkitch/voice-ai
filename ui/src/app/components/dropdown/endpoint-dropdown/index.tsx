import { Endpoint } from '@rapidaai/react';
import { useEndpointPageStore } from '@/hooks';
import { useCredential } from '@/hooks/use-credential';
import { Renew, Launch } from '@carbon/icons-react';
import { FC, useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast/headless';
import { ComboBox, Button } from '@carbon/react';

interface EndpointDropdownProps {
  className?: string;
  currentEndpoint?: string;
  onChangeEndpoint: (endpoint: Endpoint) => void;
}

export const EndpointDropdown: FC<EndpointDropdownProps> = props => {
  const [userId, token, projectId] = useCredential();
  const endpointActions = useEndpointPageStore();
  const [, setLoading] = useState(false);

  const showLoader = () => setLoading(true);
  const hideLoader = () => setLoading(false);

  const onError = useCallback((err: string) => {
    hideLoader();
    toast.error(err);
  }, []);

  const onSuccess = useCallback((data: Endpoint[]) => {
    hideLoader();
  }, []);

  const getEndpoints = useCallback((projectId, token, userId) => {
    showLoader();
    endpointActions.onGetAllEndpoint(projectId, token, userId, onError, onSuccess);
  }, []);

  useEffect(() => {
    if (props.currentEndpoint) {
      endpointActions.addCriteria('id', props.currentEndpoint, 'or');
    }
    getEndpoints(projectId, token, userId);
  }, [
    projectId,
    endpointActions.page,
    endpointActions.pageSize,
    JSON.stringify(endpointActions.criteria),
    props.currentEndpoint,
  ]);

  const selectedItem = endpointActions.endpoints.find(
    x => x.getId() === props.currentEndpoint,
  ) || null;

  return (
    <div className="flex items-end gap-1">
      <div className="flex-1">
        <ComboBox
          id="endpoint-dropdown"
          titleText="Endpoint"
          placeholder="Search and select endpoint"
          items={endpointActions.endpoints}
          selectedItem={selectedItem}
          itemToString={(item: Endpoint | null) => item?.getName() || ''}
          onChange={({ selectedItem }: any) => {
            if (selectedItem) props.onChangeEndpoint(selectedItem);
          }}
          onInputChange={(inputValue: string) => {
            if (inputValue && inputValue.trim() !== '') {
              endpointActions.addCriteria('name', inputValue, 'like');
            } else {
              endpointActions.removeCriteria('name');
            }
          }}
        />
      </div>
      <Button
        hasIconOnly
        renderIcon={Renew}
        iconDescription="Refresh"
        kind="ghost"
        size="md"
        onClick={() => getEndpoints(projectId, token, userId)}
      />
      <Button
        hasIconOnly
        renderIcon={Launch}
        iconDescription="Create endpoint"
        kind="ghost"
        size="md"
        onClick={() => window.open('/deployment/endpoint/create-endpoint', '_blank')}
      />
    </div>
  );
};
