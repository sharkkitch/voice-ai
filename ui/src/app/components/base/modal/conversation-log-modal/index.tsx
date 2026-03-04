import { AssistantConversationMessage } from '@rapidaai/react';
import { Metadata } from '@rapidaai/react';
import { Tab } from '@/app/components/tab';
import { cn } from '@/utils';
import { ModalProps } from '@/app/components/base/modal';
import { RightSideModal } from '@/app/components/base/modal/right-side-modal';
import { CodeHighlighting } from '@/app/components/code-highlighting';
import { MarkdownViewer } from '@/app/components/markdown-viewer';
import {
  BlueNoticeBlock,
  YellowNoticeBlock,
} from '@/app/components/container/message/notice-block';
import { FC } from 'react';

interface ConversationLogDialogProps extends ModalProps {
  currentAssistantMessage: AssistantConversationMessage;
}
/**
 *
 * @param props
 * @returns
 */
export function ConversationLogDialog(props: ConversationLogDialogProps) {
  return (
    <RightSideModal
      modalOpen={props.modalOpen}
      setModalOpen={props.setModalOpen}
      className="w-[580px]"
    >
      <div className="h-12 px-4 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <span className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">
          Conversation Log
        </span>
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono truncate">
          {props.currentAssistantMessage.getAssistantconversationid()}
        </span>
      </div>
      <div className="relative overflow-auto h-[calc(100vh-48px)] flex flex-col flex-1">
        <Tab
          active="Message"
          className={cn('bg-white dark:bg-gray-900 sticky top-0 z-1')}
          tabs={[
            {
              label: 'Message',
              element: (
                <div className="flex-1 p-4">
                  {props.currentAssistantMessage.getBody() ? (
                    <div className="border border-gray-200 dark:border-gray-800">
                      <MarkdownViewer
                        text={props.currentAssistantMessage.getBody()}
                      />
                    </div>
                  ) : (
                    <YellowNoticeBlock>
                      Request will be available here after the completion of
                      execution
                    </YellowNoticeBlock>
                  )}
                </div>
              ),
            },
            {
              label: 'Metrics',
              element: (
                <CodeHighlighting
                  lang="json"
                  lineNumbers={false}
                  foldGutter={false}
                  code={JSON.stringify(
                    props.currentAssistantMessage
                      ?.getMetricsList()
                      .map(metric => metric.toObject()),
                    null,
                    2,
                  )}
                />
              ),
            },
            {
              label: 'Metadata',
              element: (
                <MessageMetadatas
                  metadata={props.currentAssistantMessage.getMetadataList()}
                />
              ),
            },
          ]}
        />
      </div>
    </RightSideModal>
  );
}

const MessageMetadatas: FC<{ metadata: Array<Metadata> }> = ({ metadata }) => {
  if (metadata.length <= 0)
    return (
      <div className="w-full">
        <BlueNoticeBlock className="w-full">
          There are no metadata for given message.
        </BlueNoticeBlock>
      </div>
    );
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-800 w-full">
      {metadata.map((x, idx) => (
        <div
          key={`metadata-idx-${idx}`}
          className="flex items-center justify-between h-12 px-4 gap-4"
        >
          <span className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400 shrink-0">
            {x.getKey()}
          </span>
          <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
            {x.getValue()}
          </div>
        </div>
      ))}
    </div>
  );
};
