import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast/headless';
import { useCredential } from '@/hooks/use-credential';

import {
  ConnectionConfig,
  GetAssistantToolLog,
  GetAssistantToolLogRequest,
  AssistantToolLog,
} from '@rapidaai/react';
import { useRapidaStore } from '@/hooks';
import { Tab } from '@/app/components/tab';
import { cn } from '@/utils';
import { ModalProps } from '@/app/components/base/modal';
import { RightSideModal } from '@/app/components/base/modal/right-side-modal';
import { connectionConfig } from '@/configs';
import { CodeHighlighting } from '@/app/components/code-highlighting';

interface ToolLogModalProps extends ModalProps {
  currentActivityId: string;
}
/**
 *
 * @param props
 * @returns
 */
export function ToolLogDialog(props: ToolLogModalProps) {
  /**
   * user credentials
   */
  const [userId, token, projectId] = useCredential();
  const { showLoader, hideLoader } = useRapidaStore();
  const [activity, setActivity] = useState<AssistantToolLog | null>(null);
  const getActivity = (currentProject: string, currentActivityId) => {
    const request = new GetAssistantToolLogRequest();
    request.setProjectid(currentProject);
    request.setId(currentActivityId);
    GetAssistantToolLog(
      connectionConfig,
      request,
      ConnectionConfig.WithDebugger({
        authorization: token,
        projectId: projectId,
        userId: userId,
      }),
    ).then(at => {
      hideLoader();
      if (at?.getSuccess()) {
        let data = at.getData();
        if (data) {
          setActivity(data);
        }
      } else {
        let err = at?.getError();
        if (err) toast.error(err?.getHumanmessage());
        toast.error('Unable to resolve the request, please try again later.');
      }
    });
  };

  /**
   *
   */
  useEffect(() => {
    showLoader('overlay');
    getActivity(projectId, props.currentActivityId);
  }, [projectId, props.currentActivityId]);

  return (
    <RightSideModal
      modalOpen={props.modalOpen}
      setModalOpen={props.setModalOpen}
      className="w-[580px]"
    >
      <div className="h-12 px-4 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <span className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">
          Tool Log
        </span>
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono truncate">
          {props.currentActivityId}
        </span>
      </div>
      <div className="relative overflow-auto h-[calc(100vh-48px)] flex-1 flex flex-col">
        <Tab
          active="Request"
          className={cn('bg-white dark:bg-gray-900 sticky top-0 z-1')}
          tabs={[
            {
              label: 'Request',
              element: (
                <CodeHighlighting
                  code={JSON.stringify(
                    activity?.getRequest()?.toJavaScript(),
                    null,
                    2,
                  )}
                />
              ),
            },
            {
              label: 'Response',
              element: (
                <CodeHighlighting
                  code={JSON.stringify(
                    activity?.getResponse()?.toJavaScript(),
                    null,
                    2,
                  )}
                />
              ),
            },
          ]}
        />
      </div>
    </RightSideModal>
  );
}
