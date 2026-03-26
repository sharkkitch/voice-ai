import { ConfigureAudioInputProvider } from '@/app/pages/assistant/actions/create-deployment/commons/configure-audio-input';
import { ConfigureAudioOutputProvider } from '@/app/pages/assistant/actions/create-deployment/commons/configure-audio-output';
import {
  ConfigureExperience,
  WebWidgetExperienceConfig,
} from '@/app/pages/assistant/actions/create-deployment/web-plugin/configure-experience';
import { useRapidaStore } from '@/hooks';
import { useAllProviderCredentials } from '@/hooks/use-model';
import { useCurrentCredential } from '@/hooks/use-credential';
import { useGlobalNavigation } from '@/hooks/use-global-navigator';
import { FC, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  AssistantWebpluginDeployment,
  ConnectionConfig,
  CreateAssistantDeploymentRequest,
  CreateAssistantWebpluginDeployment,
  DeploymentAudioProvider,
  GetAssistantDeploymentRequest,
  Metadata,
} from '@rapidaai/react';
import { GetAssistantWebpluginDeployment } from '@rapidaai/react';
import toast from 'react-hot-toast/headless';
import { Helmet } from '@/app/components/helmet';
import {
  GetDefaultMicrophoneConfig,
  GetDefaultSpeechToTextIfInvalid,
  ValidateSpeechToTextIfInvalid,
} from '@/app/components/providers/speech-to-text/provider';
import {
  GetDefaultSpeakerConfig,
  GetDefaultTextToSpeechIfInvalid,
  ValidateTextToSpeechIfInvalid,
} from '@/app/components/providers/text-to-speech/provider';
import { connectionConfig } from '@/configs';
import { AssistantWebwidgetDeploymentDialog } from '@/app/components/base/modal/assistant-instruction-modal';
import { TabForm } from '@/app/components/form/tab-form';
import { useConfirmDialog } from '@/app/pages/assistant/actions/hooks/use-confirmation';
import {
  IBlueBGArrowButton,
  ICancelButton,
} from '@/app/components/form/button';
import { InputCheckbox } from '@/app/components/form/checkbox';
import { InputHelper } from '@/app/components/input-helper';
import { BaseCard } from '@/app/components/base/cards';

const STEPS = [
  {
    code: 'experience',
    name: 'Experience',
    description:
      'Define the greeting, quick-start questions, and session behaviour.',
  },
  {
    code: 'voice-input',
    name: 'Voice Input',
    description:
      'Configure the speech-to-text provider for capturing user audio.',
  },
  {
    code: 'voice-output',
    name: 'Voice Output',
    description: 'Configure the text-to-speech provider for audio responses.',
  },
];

export function ConfigureAssistantWebDeploymentPage() {
  const { assistantId } = useParams();
  return (
    <>
      <Helmet title="Configure web-plugin deployment" />
      {assistantId && (
        <ConfigureAssistantWebDeployment assistantId={assistantId} />
      )}
    </>
  );
}

const ConfigureAssistantWebDeployment: FC<{ assistantId: string }> = ({
  assistantId,
}) => {
  const { goToDeploymentAssistant } = useGlobalNavigation();
  const { loading, showLoader, hideLoader } = useRapidaStore();
  const { providerCredentials } = useAllProviderCredentials();
  const { authId, projectId, token } = useCurrentCredential();
  const { showDialog, ConfirmDialogComponent } = useConfirmDialog({});

  const [activeTab, setActiveTab] = useState('experience');
  const [errorMessage, setErrorMessage] = useState('');
  const [showInstruction, setShowInstruction] = useState(false);
  const [deploymentId, setDeploymentId] = useState<string | null>(null);
  const [voiceInputEnable, setVoiceInputEnable] = useState(false);
  const [voiceOutputEnable, setVoiceOutputEnable] = useState(true);

  const [experienceConfig, setExperienceConfig] =
    useState<WebWidgetExperienceConfig>({
      greeting: undefined,
      messageOnError: undefined,
      idealTimeout: '30',
      idealMessage: 'Are you there?',
      maxCallDuration: '300',
      idleTimeoutBackoffTimes: '2',
      suggestions: [],
    });

  const [audioInputConfig, setAudioInputConfig] = useState<{
    provider: string;
    parameters: Metadata[];
  }>({
    provider: 'deepgram',
    parameters: GetDefaultSpeechToTextIfInvalid(
      'deepgram',
      GetDefaultMicrophoneConfig(),
    ),
  });

  const [audioOutputConfig, setAudioOutputConfig] = useState<{
    provider: string;
    parameters: Metadata[];
  }>({
    provider: 'cartesia',
    parameters: GetDefaultTextToSpeechIfInvalid(
      'cartesia',
      GetDefaultSpeakerConfig(),
    ),
  });

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    showLoader('block');
    const req = new GetAssistantDeploymentRequest();
    req.setAssistantid(assistantId);
    GetAssistantWebpluginDeployment(
      connectionConfig,
      req,
      ConnectionConfig.WithDebugger({
        authorization: token,
        userId: authId,
        projectId,
      }),
    )
      .then(response => {
        hideLoader();
        const deployment = response?.getData();
        if (!deployment) return;

        setDeploymentId(deployment.getId() ?? null);
        setExperienceConfig({
          greeting: deployment.getGreeting(),
          suggestions: deployment.getSuggestionList() || [],
          messageOnError: deployment.getMistake(),
          idealTimeout: deployment.getIdealtimeout(),
          idealMessage: deployment.getIdealtimeoutmessage(),
          maxCallDuration: deployment.getMaxsessionduration(),
          idleTimeoutBackoffTimes: deployment.getIdealtimeoutbackoff(),
        });

        if (deployment.getInputaudio()) {
          const provider = deployment.getInputaudio()!;
          setVoiceInputEnable(true);
          setAudioInputConfig({
            provider: provider.getAudioprovider() || 'deepgram',
            parameters: GetDefaultSpeechToTextIfInvalid(
              provider.getAudioprovider() || 'deepgram',
              GetDefaultMicrophoneConfig(
                provider.getAudiooptionsList() || [],
              ),
            ),
          });
        }

        if (deployment.getOutputaudio()) {
          const provider = deployment.getOutputaudio()!;
          setVoiceOutputEnable(true);
          setAudioOutputConfig({
            provider: provider.getAudioprovider() || 'cartesia',
            parameters: GetDefaultTextToSpeechIfInvalid(
              provider.getAudioprovider() || 'cartesia',
              GetDefaultSpeakerConfig(
                provider.getAudiooptionsList() || [],
              ),
            ),
          });
        }

      })
      .catch(err => {
        hideLoader();
        setErrorMessage(
          err?.message || 'Failed to fetch deployment configuration',
        );
      });
  }, [assistantId, token, authId, projectId]);

  const getProviderCredentialIds = (provider: string) =>
    providerCredentials
      .filter(c => c.getProvider() === provider)
      .map(c => c.getId());

  const handleTabChange = (code: string) => {
    const clickedIndex = STEPS.findIndex(s => s.code === code);
    const currentIndex = STEPS.findIndex(s => s.code === activeTab);
    if (clickedIndex < currentIndex) {
      setActiveTab(code);
      setErrorMessage('');
    }
  };

  const handleNext = () => {
    setErrorMessage('');
    const idx = STEPS.findIndex(s => s.code === activeTab);

    if (activeTab === 'experience') {
      if (!experienceConfig.greeting) {
        setErrorMessage('Please provide a greeting for the assistant.');
        return;
      }
    }

    if (activeTab === 'voice-input') {
      if (voiceInputEnable) {
        if (!audioInputConfig.provider) {
          setErrorMessage('Please select a speech-to-text provider.');
          return;
        }
        const err = ValidateSpeechToTextIfInvalid(
          audioInputConfig.provider,
          audioInputConfig.parameters,
          getProviderCredentialIds(audioInputConfig.provider),
        );
        if (err) {
          setErrorMessage(err);
          return;
        }
      }
    }

    if (idx < STEPS.length - 1) {
      setActiveTab(STEPS[idx + 1].code);
    }
  };

  const handleDeployWebPlugin = () => {
    showLoader('block');
    setErrorMessage('');

    if (!experienceConfig.greeting) {
      hideLoader();
      setErrorMessage('Please provide a greeting for the assistant.');
      return;
    }

    if (voiceInputEnable) {
      if (!audioInputConfig.provider) {
        hideLoader();
        setErrorMessage(
          'Please provide a provider for interpreting input audio.',
        );
        return;
      }
      const err = ValidateSpeechToTextIfInvalid(
        audioInputConfig.provider,
        audioInputConfig.parameters,
        getProviderCredentialIds(audioInputConfig.provider),
      );
      if (err) {
        hideLoader();
        setErrorMessage(err);
        return;
      }
    }

    if (voiceOutputEnable) {
      if (!audioOutputConfig.provider) {
        hideLoader();
        setErrorMessage(
          'Please provide a provider for interpreting output audio.',
        );
        return;
      }
      const err = ValidateTextToSpeechIfInvalid(
        audioOutputConfig.provider,
        audioOutputConfig.parameters,
        getProviderCredentialIds(audioOutputConfig.provider),
      );
      if (err) {
        hideLoader();
        setErrorMessage(err);
        return;
      }
    }

    const req = new CreateAssistantDeploymentRequest();
    const webDeployment = new AssistantWebpluginDeployment();
    webDeployment.setAssistantid(assistantId);
    if (experienceConfig.greeting)
      webDeployment.setGreeting(experienceConfig.greeting);
    if (experienceConfig.messageOnError)
      webDeployment.setMistake(experienceConfig.messageOnError);
    if (experienceConfig.idealTimeout)
      webDeployment.setIdealtimeout(experienceConfig.idealTimeout);
    if (experienceConfig.idleTimeoutBackoffTimes)
      webDeployment.setIdealtimeoutbackoff(
        experienceConfig.idleTimeoutBackoffTimes,
      );
    if (experienceConfig.idealMessage)
      webDeployment.setIdealtimeoutmessage(experienceConfig.idealMessage);
    if (experienceConfig.maxCallDuration)
      webDeployment.setMaxsessionduration(experienceConfig.maxCallDuration);

    webDeployment.setSuggestionList(experienceConfig.suggestions);
    webDeployment.setHelpcenterenabled(false);
    webDeployment.setProductcatalogenabled(false);
    webDeployment.setArticlecatalogenabled(false);
    webDeployment.setUploadfileenabled(false);

    if (voiceInputEnable) {
      const inputAudio = new DeploymentAudioProvider();
      inputAudio.setAudioprovider(audioInputConfig.provider);
      inputAudio.setAudiooptionsList(audioInputConfig.parameters);
      webDeployment.setInputaudio(inputAudio);
    }

    if (voiceOutputEnable) {
      const outputAudio = new DeploymentAudioProvider();
      outputAudio.setAudioprovider(audioOutputConfig.provider);
      outputAudio.setAudiooptionsList(audioOutputConfig.parameters);
      webDeployment.setOutputaudio(outputAudio);
    }

    req.setPlugin(webDeployment);
    CreateAssistantWebpluginDeployment(
      connectionConfig,
      req,
      ConnectionConfig.WithDebugger({
        authorization: token,
        userId: authId,
        projectId,
      }),
    )
      .then(response => {
        hideLoader();
        if (response?.getData() && response.getSuccess()) {
          if (deploymentId) {
            toast.success('Web widget deployment updated successfully.');
            goToDeploymentAssistant(assistantId);
            return;
          }
          setShowInstruction(true);
        } else {
          setErrorMessage(
            response?.getError()?.getHumanmessage() ||
              'Unable to create deployment, please try again.',
          );
        }
      })
      .catch(err => {
        hideLoader();
        setErrorMessage(
          err?.message || 'Error deploying web widget. Please try again.',
        );
      });
  };

  return (
    <>
      <ConfirmDialogComponent />
      <AssistantWebwidgetDeploymentDialog
        assistantId={assistantId}
        modalOpen={showInstruction}
        setModalOpen={() => {
          setShowInstruction(false);
          goToDeploymentAssistant(assistantId);
        }}
      />
      <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-gray-900">
        {/* Page header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0 flex items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Web Widget Deployment
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Embed a voice-enabled chat widget on your website.
            </p>
          </div>
        </div>

        <TabForm
          formHeading="Complete all steps to configure your web widget deployment."
          activeTab={activeTab}
          onChangeActiveTab={handleTabChange}
          errorMessage={errorMessage}
          form={[
            {
              code: 'experience',
              name: 'General Experience',
              description:
                'Define the greeting, quick-start questions, and session behaviour.',
              body: (
                <ConfigureExperience
                  experienceConfig={experienceConfig}
                  setExperienceConfig={setExperienceConfig}
                />
              ),
              actions: [
                <ICancelButton
                  className="w-full h-full"
                  onClick={() =>
                    showDialog(() => goToDeploymentAssistant(assistantId))
                  }
                >
                  Cancel
                </ICancelButton>,
                <IBlueBGArrowButton
                  type="button"
                  className="w-full h-full"
                  onClick={handleNext}
                >
                  Next
                </IBlueBGArrowButton>,
              ],
            },
            {
              code: 'voice-input',
              name: 'Voice Input',
              description:
                'Configure the speech-to-text provider for capturing user audio.',
              body: (
                <div>
                  <div className="px-6 pt-6 pb-4">
                    <BaseCard className="p-4 gap-2">
                      <InputCheckbox
                        checked={voiceInputEnable}
                        onChange={e => setVoiceInputEnable(e.target.checked)}
                      >
                        Enable voice input (Speech-to-Text)
                      </InputCheckbox>
                      <InputHelper>
                        {voiceInputEnable
                          ? 'Voice input is currently enabled.'
                          : 'Voice input is disabled. This deployment will not transcribe user speech, and existing STT settings will be removed when you save.'}
                      </InputHelper>
                    </BaseCard>
                  </div>
                  {voiceInputEnable && (
                    <ConfigureAudioInputProvider
                      audioInputConfig={audioInputConfig}
                      setAudioInputConfig={setAudioInputConfig}
                    />
                  )}
                </div>
              ),
              actions: [
                <ICancelButton
                  className="w-full h-full"
                  onClick={() =>
                    showDialog(() => goToDeploymentAssistant(assistantId))
                  }
                >
                  Cancel
                </ICancelButton>,
                <IBlueBGArrowButton
                  type="button"
                  className="w-full h-full"
                  onClick={handleNext}
                >
                  Next
                </IBlueBGArrowButton>,
              ],
            },
            {
              code: 'voice-output',
              name: 'Voice Output',
              description:
                'Configure the text-to-speech provider for audio responses.',
              body: (
                <div>
                  <div className="px-6 pt-6 pb-4">
                    <BaseCard className="p-4 gap-2">
                      <InputCheckbox
                        checked={voiceOutputEnable}
                        onChange={e => setVoiceOutputEnable(e.target.checked)}
                      >
                        Enable voice output (Text-to-Speech)
                      </InputCheckbox>
                      <InputHelper>
                        {voiceOutputEnable
                          ? 'Voice output is currently enabled.'
                          : 'Voice output is disabled. Assistant responses will be text only.'}
                      </InputHelper>
                    </BaseCard>
                  </div>
                  {voiceOutputEnable && (
                    <ConfigureAudioOutputProvider
                      audioOutputConfig={audioOutputConfig}
                      setAudioOutputConfig={setAudioOutputConfig}
                    />
                  )}
                </div>
              ),
              actions: [
                <ICancelButton
                  className="w-full h-full"
                  onClick={() =>
                    showDialog(() => goToDeploymentAssistant(assistantId))
                  }
                >
                  Cancel
                </ICancelButton>,
                <IBlueBGArrowButton
                  type="button"
                  className="w-full h-full"
                  isLoading={loading}
                  onClick={handleDeployWebPlugin}
                >
                  Deploy Web Widget
                </IBlueBGArrowButton>,
              ],
            },
          ]}
        />
      </div>
    </>
  );
};
