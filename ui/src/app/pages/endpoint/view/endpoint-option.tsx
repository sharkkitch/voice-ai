import React, { useContext } from 'react';
import { CardOptionMenu } from '@/app/components/menu';
import { useEndpointPageStore } from '@/hooks';
import { Endpoint, EndpointProviderModel } from '@rapidaai/react';

interface EndpointOptionProps {
  endpoint: Endpoint;
  endpointProviderModel?: EndpointProviderModel;
}
/**
 *
 * @param props
 * @returns
 */
export function EndpointOptions(props: EndpointOptionProps) {
  /**
   * action
   */
  const endpointActions = useEndpointPageStore();

  /**
   * options that will be display
   */
  const options = [
    {
      option: 'Integration guide',
      onActionClick: () => {
        endpointActions.onShowInstruction();
      },
    },
    {
      option: 'Edit tags',
      onActionClick: () => {
        endpointActions.onShowEditTagVisible(props.endpoint);
      },
    },
    {
      option: 'Edit details',
      onActionClick: () => {
        endpointActions.onShowUpdateDetailVisible(props.endpoint);
      },
    },
  ];
  return <CardOptionMenu options={options} classNames="rounded-[2px]" />;
}
