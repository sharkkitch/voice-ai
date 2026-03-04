import { Metadata } from '@rapidaai/react';
import { CloudStorageProvider } from '@/app/components/providers/storage';

export interface StorageConfig {
  providerId: string;
  provider: string;
  parameters: Metadata[];
}

export const ConfigureCapturer: React.FC<{
  allowed: string[];
  onChangeAudioConfig: (config: StorageConfig | null) => void;
  audioConfig: StorageConfig | null;
  onChangeTextConfig: (config: StorageConfig | null) => void;
  textConfig: StorageConfig | null;
}> = ({
  allowed,
  onChangeAudioConfig,
  audioConfig,
  onChangeTextConfig,
  textConfig,
}) => {
  return (
    <>
      {allowed.includes('text') && (
        <div className="border-b dark:border-gray-800">
          <div className="px-5 py-4 border-b dark:border-gray-800">
            <h2 className="text-sm font-semibold">Text Messages</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Store conversation transcripts to a cloud storage provider.
            </p>
          </div>
          <div className="px-5 py-5">
            <CloudStorageProvider
              key={'text'}
              onChangeConfig={onChangeTextConfig}
              config={textConfig}
            />
          </div>
        </div>
      )}
      {allowed.includes('audio') && (
        <div className="border-b dark:border-gray-800">
          <div className="px-5 py-4 border-b dark:border-gray-800">
            <h2 className="text-sm font-semibold">Audio Recording</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Save call audio recordings to a cloud storage provider.
            </p>
          </div>
          <div className="px-5 py-5">
            <CloudStorageProvider
              key={'audio'}
              onChangeConfig={onChangeAudioConfig}
              config={audioConfig}
            />
          </div>
        </div>
      )}
    </>
  );
};
