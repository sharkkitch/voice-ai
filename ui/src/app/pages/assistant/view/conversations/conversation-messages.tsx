import { useCredential } from '@/hooks/use-credential';
import {
  AssistantConversation,
  AssistantConversationMessage,
} from '@rapidaai/react';
import { RapidaIcon } from '@/app/components/Icon/Rapida';
import { FC, useCallback, useContext, useEffect, useRef } from 'react';
import { AssistantChatContext } from '@/hooks/use-assistant-chat';
import { useBoolean } from 'ahooks';
import { SectionLoader } from '@/app/components/loader/section-loader';
import { ArrowDownToLine, Clock, RotateCw, Zap } from 'lucide-react';
import { IButton } from '@/app/components/form/button';
import { ActionableEmptyMessage } from '@/app/components/container/message/actionable-empty-message';
import {
  getMetadataValueOrDefault,
  getStatusMetric,
  getTotalTokenMetric,
} from '@/utils/metadata';
import { StatusIndicator } from '@/app/components/indicators/status';
import { toHumanReadableDateTime } from '@/utils/date';
import { AudioPlayer } from '@/app/components/audio-player';

export const ConversationMessages: FC<{
  conversation: AssistantConversation;
  assistantId: string;
  conversationId: string;
}> = ({ conversation, conversationId, assistantId }) => {
  const [userId, token, projectId] = useCredential();
  const [loading, { setTrue: showLoader, setFalse: hideLoader }] =
    useBoolean(false);

  const {
    conversations,
    onGetConversationMessages,
    onChangeConversationMessages,
  } = useContext(AssistantChatContext);

  const ctrRef = useRef<HTMLDivElement>(null);

  const get = () => {
    showLoader();
    onGetConversationMessages(
      assistantId,
      conversationId,
      projectId,
      token,
      userId,
      () => hideLoader(),
      callbackOnGetConversationMessages,
    );
  };

  useEffect(() => {
    get();
  }, [assistantId, conversationId]);

  const callbackOnGetConversationMessages = useCallback(
    (msgs: Array<AssistantConversationMessage>) => {
      onChangeConversationMessages(msgs);
      scrollTo(ctrRef);
      hideLoader();
    },
    [],
  );

  const scrollTo = ref => {
    setTimeout(
      () =>
        ref.current?.scrollIntoView({ inline: 'center', behavior: 'smooth' }),
      777,
    );
  };

  function csvEscape(str: string): string {
    return `"${str.replace(/"/g, '""')}"`;
  }

  const downloadAllMessages = () => {
    const csvContent = [
      'role,message',
      ...conversations.flatMap((row: AssistantConversationMessage) => [
        `${row.getRole()},${csvEscape(row.getBody())}`,
      ]),
    ].join('\n');
    const url = URL.createObjectURL(
      new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', conversationId + '-messages.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <SectionLoader />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full relative" ref={ctrRef}>
      {/* Recordings */}
      {conversation.getRecordingsList().map((x, idx) => (
        <div key={idx}>
          <div className="flex items-center h-8 px-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 shrink-0">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">
              Recording {idx + 1}
            </p>
          </div>
          <AudioPlayer recording={x} />
        </div>
      ))}

      {/* ── Slim toolbar ── */}
      <div className="flex items-stretch h-10 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-[2] shrink-0">
        <div className="flex-1 flex items-center px-4">
          <span className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">
            {conversations.length}{' '}
            {conversations.length === 1 ? 'message' : 'messages'}
          </span>
        </div>
        <div className="flex items-stretch border-l border-gray-200 dark:border-gray-800">
          <div className="flex items-center px-4 border-r border-gray-200 dark:border-gray-800">
            <StatusIndicator
              state={getStatusMetric(conversation.getMetricsList())}
            />
          </div>
          <div className="w-px self-stretch bg-gray-200 dark:bg-gray-800 shrink-0" />
          <IButton onClick={get}>
            <RotateCw strokeWidth={1.5} className="h-4 w-4" />
          </IButton>
          <div className="w-px self-stretch bg-gray-200 dark:bg-gray-800 shrink-0" />
          <IButton onClick={downloadAllMessages}>
            <ArrowDownToLine strokeWidth={1.5} className="h-4 w-4" />
          </IButton>
        </div>
      </div>

      {/* ── Empty state ── */}
      {conversations.length === 0 && (
        <div className="my-auto mx-auto">
          <ActionableEmptyMessage
            title="No messages yet"
            subtitle="There are no messages yet for this conversation"
          />
        </div>
      )}

      {/* ── Message list ── */}
      {conversations.map((x, idx) => (
        <div
          className="flex flex-col w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
          key={idx}
        >
          {x.getBody() && (
            <div className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-800">
              {/* Avatar */}
              {x.getRole() === 'rapida' ? (
                <div className="h-8 w-8 shrink-0 bg-blue-100/80 dark:bg-blue-900/80 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  <RapidaIcon className="h-4 w-4 text-blue-600" />
                </div>
              ) : x.getRole() === 'assistant' ? (
                <div className="h-8 w-8 shrink-0 bg-emerald-100/80 dark:bg-emerald-900/80 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">A</span>
                </div>
              ) : (
                <div className="h-8 w-8 shrink-0 bg-zinc-200/80 dark:bg-zinc-800/80 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">U</span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400 mb-1">
                  {x.getRole()}
                </p>
                <div className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed [&_:is([data-link],a:link,a:visited,a:hover,a:active)]:text-primary [&_:is([data-link],a:link,a:visited,a:hover,a:active):hover]:underline [&_:is(code,div[data-lang])]:font-mono [&_:is(code,div[data-lang])]:bg-overlay [&_:is(code,div[data-lang])]:rounded-[2px] [&_is:(code)]:p-0.5 [&_div[data-lang]]:p-2 [&_div[data-lang]]:overflow-auto [&_:is(p,ul,ol,dl,table,blockquote,div[data-lang],h4,h5,h6,hr):not(:first-child)]:mt-2 [&_:is(p,ul,ol,dl,table,blockquote,div[data-lang],h3,h4,h5,h6,hr):not(:last-child)]:mb-2 [&_:is(ul,ol)]:pl-5 [&_ul]:list-disc [&_ol]:list-decimal [&_[data-user]]:text-primary [&_:is(strong,h1,h2,h3,h4,h5,h6)]:font-semibold whitespace-pre-wrap break-words">
                  {x.getBody()}
                </div>
              </div>
            </div>
          )}

          {/* ── Metadata footer ── */}
          <div className="flex items-center justify-end gap-2 px-4 py-1.5">
            <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
              {toHumanReadableDateTime(x.getCreateddate()!)}
            </span>
            <div className="flex items-center divide-x divide-gray-200 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
              <div className="px-2 py-1 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-emerald-500" />
                <span>{getTotalTokenMetric(x.getMetricsList())} tokens</span>
              </div>
              <div className="px-2 py-1 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-purple-400" />
                <span>{getTotalTokenMetric(x.getMetricsList())} ms</span>
              </div>
              <div className="px-2 py-1">
                <span className="capitalize">
                  {getMetadataValueOrDefault(x.getMetadataList(), 'mode', 'text')}
                </span>
              </div>
              <div className="px-2 py-1">
                <span>{getStatusMetric(x.getMetricsList())}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
