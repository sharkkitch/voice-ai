import { Metadata } from '@rapidaai/react';
import { SliderField } from '@/app/components/providers/end-of-speech/slider-field';
import { useVadParams } from '@/app/components/providers/vad/use-vad-params';
import { BlueNoticeBlock } from '../../../container/message/notice-block';

export const ConfigureSileroVAD: React.FC<{
  onParameterChange: (parameters: Metadata[]) => void;
  parameters: Metadata[];
}> = ({ onParameterChange, parameters }) => {
  const { get, set } = useVadParams(parameters, onParameterChange);

  return (
    <>
      <BlueNoticeBlock className="text-xs">
        Silero VAD is a lightweight ONNX model (~2MB) for real-time voice
        activity detection. Optimized for low-latency streaming at 16kHz.
      </BlueNoticeBlock>
      <SliderField
        label="VAD Threshold"
        hint="Speech probability threshold. A good default is 0.6. Lower = more sensitive, higher = fewer false triggers."
        min={0.3}
        max={1}
        step={0.05}
        parse={parseFloat}
        value={get('microphone.vad.threshold', '0.5')}
        onChange={v => set('microphone.vad.threshold', v)}
      />
      <SliderField
        label="Min Silence Frames"
        hint="Minimum number of consecutive silence frames before ending a speech segment."
        min={1}
        max={30}
        step={1}
        value={get('microphone.vad.min_silence_frame', '20')}
        onChange={v => set('microphone.vad.min_silence_frame', v)}
      />
      <SliderField
        label="Min Speech Frames"
        hint="Minimum number of consecutive speech frames before starting a speech segment."
        min={1}
        max={20}
        step={1}
        value={get('microphone.vad.min_speech_frame', '8')}
        onChange={v => set('microphone.vad.min_speech_frame', v)}
      />
    </>
  );
};
