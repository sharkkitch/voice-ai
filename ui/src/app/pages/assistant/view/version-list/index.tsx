import { useAssistantProviderPageStore } from '@/hooks';
import { useCredential } from '@/hooks/use-credential';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast/headless';
import { Assistant, GetAllAssistantProviderResponse } from '@rapidaai/react';
import { RevisionIndicator } from '@/app/components/indicators/revision';
import { SectionLoader } from '@/app/components/loader/section-loader';
import { TableSection } from '@/app/components/sections/table-section';
import { ScrollableResizableTable } from '@/app/components/data-table';
import { TableRow } from '@/app/components/base/tables/table-row';
import { TableCell } from '@/app/components/base/tables/table-cell';
import { AssistantProviderIndicator } from '@/app/components/indicators/assistant-provider';
import { VersionIndicator } from '@/app/components/indicators/version';
import { DateCell } from '@/app/components/base/tables/date-cell';
import { NameCell } from '@/app/components/base/tables/name-cell';

interface VersionProps {
  assistant: Assistant;
  onReload: () => void;
}

export function Version(props: VersionProps) {
  const [userId, token, projectId] = useCredential();
  const assistantProviderAction = useAssistantProviderPageStore();
  const [isFetching, setIsFetching] = useState(true);
  const [deployingProviderId, setDeployingProviderId] = useState<
    string | null
  >(null);

  useEffect(() => {
    setIsFetching(true);
    assistantProviderAction.onChangeAssistant(props.assistant);
    assistantProviderAction.getAssistantProviders(
      props.assistant.getId(),
      projectId,
      token,
      userId,
      (err: string) => {
        setIsFetching(false);
        toast.error(err);
      },
      data => {
        setIsFetching(false);
      },
    );
  }, [
    props.assistant.getId(),
    projectId,
    assistantProviderAction.page,
    assistantProviderAction.pageSize,
    assistantProviderAction.criteria,
  ]);

  const deployRevision = (
    assistantProvider: string,
    assistantProviderId: string,
  ) => {
    setDeployingProviderId(assistantProviderId);
    assistantProviderAction.onReleaseVersion(
      assistantProvider,
      assistantProviderId,
      projectId,
      token,
      userId,
      error => {
        setDeployingProviderId(null);
        toast.error(error);
      },
      e => {
        toast.success(
          'New version of assistant has been deployed successfully.',
        );
        assistantProviderAction.onChangeAssistant(e);
        props.onReload();
        setDeployingProviderId(null);
      },
    );
  };
  if (isFetching) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <SectionLoader />
      </div>
    );
  }

  return (
    <TableSection>
      <ScrollableResizableTable
        isActionable={false}
        clms={assistantProviderAction.columns.filter(x => x.visible)}
      >
        {assistantProviderAction.assistantProviders.map((apm, idx) => {
          switch (apm.getAssistantproviderCase()) {
            case GetAllAssistantProviderResponse.AssistantProvider
              .AssistantproviderCase.ASSISTANTPROVIDERMODEL:
              return (
                <TableRow key={idx} data-id={idx}>
                  <TableCell>
                    <VersionIndicator id={apm.getAssistantprovidermodel()?.getId()!} />
                  </TableCell>
                  <TableCell>
                    <AssistantProviderIndicator provider="provider-model" />
                  </TableCell>
                  <TableCell>
                    {apm.getAssistantprovidermodel()?.getDescription()
                      ? apm.getAssistantprovidermodel()?.getDescription()
                      : 'Initial assistant version'}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const providerId =
                        apm.getAssistantprovidermodel()?.getId()!;
                      const isCurrent =
                        assistantProviderAction.assistant?.getAssistantproviderid() ===
                        providerId;
                      const isDeploying = deployingProviderId === providerId;
                      return (
                    <RevisionIndicator
                      status={
                        isCurrent
                          ? 'DEPLOYED'
                          : isDeploying
                            ? 'DEPLOYING'
                            : 'NOT_DEPLOYED'
                      }
                      onClick={
                        !isCurrent && !isDeploying
                          ? () =>
                              deployRevision(
                                'MODEL',
                                providerId,
                              )
                          : undefined
                      }
                    />
                      );
                    })()}
                  </TableCell>
                  <NameCell data-id={apm.getAssistantprovidermodel()?.getId()}>
                    {apm.getAssistantprovidermodel()?.getCreateduser() &&
                      apm
                        .getAssistantprovidermodel()
                        ?.getCreateduser()
                        ?.getName()!}
                  </NameCell>
                  <DateCell
                    date={apm.getAssistantprovidermodel()?.getCreateddate()}
                  />
                </TableRow>
              );
            case GetAllAssistantProviderResponse.AssistantProvider
              .AssistantproviderCase.ASSISTANTPROVIDERAGENTKIT:
              return (
                <TableRow key={idx} className="cursor-pointer" data-id={idx}>
                  <TableCell>
                    <VersionIndicator id={apm.getAssistantprovideragentkit()?.getId()!} />
                  </TableCell>
                  <TableCell>
                    <AssistantProviderIndicator provider="agentkit" />
                  </TableCell>
                  <TableCell>
                    {apm.getAssistantprovideragentkit()?.getDescription()
                      ? apm.getAssistantprovideragentkit()?.getDescription()
                      : 'Initial assistant version'}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const providerId =
                        apm.getAssistantprovideragentkit()?.getId()!;
                      const isCurrent =
                        assistantProviderAction.assistant?.getAssistantproviderid() ===
                        providerId;
                      const isDeploying = deployingProviderId === providerId;
                      return (
                    <RevisionIndicator
                      status={
                        isCurrent
                          ? 'DEPLOYED'
                          : isDeploying
                            ? 'DEPLOYING'
                            : 'NOT_DEPLOYED'
                      }
                      onClick={
                        !isCurrent && !isDeploying
                          ? () =>
                              deployRevision(
                                'AGENTKIT',
                                providerId,
                              )
                          : undefined
                      }
                    />
                      );
                    })()}
                  </TableCell>
                  <NameCell>
                    {
                      apm
                        .getAssistantprovideragentkit()
                        ?.getCreateduser()
                        ?.getName()!
                    }
                  </NameCell>
                  <DateCell
                    date={apm.getAssistantprovideragentkit()?.getCreateddate()}
                  ></DateCell>
                </TableRow>
              );
            case GetAllAssistantProviderResponse.AssistantProvider
              .AssistantproviderCase.ASSISTANTPROVIDERWEBSOCKET:
              return (
                <TableRow key={idx}>
                  <TableCell>
                    <VersionIndicator id={apm.getAssistantproviderwebsocket()?.getId()!} />
                  </TableCell>
                  <TableCell>
                    <AssistantProviderIndicator provider="websocket" />
                  </TableCell>
                  <TableCell>
                    {apm.getAssistantproviderwebsocket()?.getDescription()
                      ? apm.getAssistantproviderwebsocket()?.getDescription()
                      : 'Initial assistant version'}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const providerId =
                        apm.getAssistantproviderwebsocket()?.getId()!;
                      const isCurrent =
                        assistantProviderAction.assistant?.getAssistantproviderid() ===
                        providerId;
                      const isDeploying = deployingProviderId === providerId;
                      return (
                    <RevisionIndicator
                      status={
                        isCurrent
                          ? 'DEPLOYED'
                          : isDeploying
                            ? 'DEPLOYING'
                            : 'NOT_DEPLOYED'
                      }
                      onClick={
                        !isCurrent && !isDeploying
                          ? () =>
                              deployRevision(
                                'WEBSOCKET',
                                providerId,
                              )
                          : undefined
                      }
                    />
                      );
                    })()}
                  </TableCell>
                  <NameCell>
                    {apm.getAssistantproviderwebsocket()?.getCreateduser() &&
                      apm
                        .getAssistantproviderwebsocket()
                        ?.getCreateduser()
                        ?.getName()!}
                  </NameCell>
                  <DateCell
                    date={apm.getAssistantproviderwebsocket()?.getCreateddate()}
                  ></DateCell>
                </TableRow>
              );
            default:
              return null;
          }
        })}
      </ScrollableResizableTable>
    </TableSection>
  );
}
