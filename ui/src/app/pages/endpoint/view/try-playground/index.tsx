import { Endpoint, EndpointProviderModel } from '@rapidaai/react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { TryChatComplete } from '@/app/pages/endpoint/view/try-playground/experiment-prompt/try-chat-complete';
import { InputGroup } from '@/app/components/input-group';
import { Helmet } from '@/app/components/helmet';
import { BotIcon, Code, ExternalLink, PencilRuler } from 'lucide-react';
export function Playground(props: {
  currentEndpoint: Endpoint;
  currentEndpointProviderModel: EndpointProviderModel;
}) {
  return (
    <PanelGroup direction="horizontal" className="grow">
      <Helmet title={props.currentEndpoint.getName()} />
      <Panel className="flex flex-1 flex-col items-stretch overflow-y-auto! bg-white dark:bg-gray-900">
        <InputGroup
          title={
            <div className="flex items-center gap-2 text-muted font-normal text-sm/6">
              Integrate into your application
            </div>
          }
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Integrate this endpoint directly into your application code using
            our SDK.
          </p>
          <a
            target="_blank"
            href="https://doc.rapida.ai/api-reference/endpoint/invoke"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline underline-offset-2"
            rel="noreferrer"
          >
            Read documentation
            <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
          </a>
        </InputGroup>

        <InputGroup
          title={
            <div className="flex items-center gap-2 text-muted font-normal text-sm/6">
              Post conversation LLM analysis
            </div>
          }
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Enhance your assistant's capabilities with LLM analysis using this
            endpoint.
          </p>
          <ol className="space-y-4">
            {[
              <>
                Navigate to the{' '}
                <span className="text-primary font-medium">Assistants</span>{' '}
                page
              </>,
              <>Select your assistant</>,
              <>
                Go to the <span className="font-medium">'Manage'</span> tab
              </>,
              <>
                Add this endpoint under{' '}
                <span className="font-medium">'Analysis'</span>
              </>,
            ].map((content, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300"
              >
                <span className="shrink-0 w-5 h-5 bg-gray-200 dark:bg-gray-800 dark:text-white text-gray-900 flex items-center justify-center text-xs font-semibold tabular-nums">
                  {i + 1}
                </span>
                <span className="leading-snug pt-0.5">{content}</span>
              </li>
            ))}
          </ol>
        </InputGroup>

        <InputGroup
          title={
            <div className="flex items-center gap-2 text-muted font-normal text-sm/6">
              Tool calls to the LLM
            </div>
          }
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Enhance your assistant's capabilities with targeted LLM tool calls
            using this endpoint.
          </p>
          <ol className="space-y-4">
            {[
              <>
                Navigate to the{' '}
                <span className="text-primary font-medium">Assistants</span>{' '}
                page
              </>,
              <>Select your assistant</>,
              <>
                Go to the <span className="font-medium">'Manage'</span> tab
              </>,
              <>
                Add this endpoint under{' '}
                <span className="font-medium">'Tool Call — LLM Call'</span>
              </>,
            ].map((content, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300"
              >
                <span className="shrink-0 w-5 h-5 bg-gray-200 dark:bg-gray-800 dark:text-white text-gray-900 flex items-center justify-center text-xs font-semibold tabular-nums">
                  {i + 1}
                </span>
                <span className="leading-snug pt-0.5">{content}</span>
              </li>
            ))}
          </ol>
        </InputGroup>
      </Panel>
      <PanelResizeHandle className="flex w-px! bg-gray-200 dark:bg-gray-800 hover:bg-primary items-stretch"></PanelResizeHandle>
      <Panel className="flex flex-col overflow-y-auto">
        <div className="flex flex-1 flex-col items-stretch overflow-hidden">
          <TryChatComplete
            currentEndpoint={props.currentEndpoint}
            endpointProviderModel={props.currentEndpointProviderModel}
          />
        </div>
      </Panel>
    </PanelGroup>
  );
}
