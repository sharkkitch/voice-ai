import ConfigSelect from '@/app/components/configuration/config-var/config-select';
import { FormLabel } from '@/app/components/form-label';
import { FieldSet } from '@/app/components/form/fieldset';
import { Input } from '@/app/components/form/input';
import { Slider } from '@/app/components/form/slider';
import { Textarea } from '@/app/components/form/textarea';
import { InputHelper } from '@/app/components/input-helper';
import { ExperienceConfig } from '@/app/pages/assistant/actions/create-deployment/commons/configure-experience';
import { cn } from '@/utils';
import { ChevronDown } from 'lucide-react';
import { FC, useState } from 'react';

export interface WebWidgetExperienceConfig extends ExperienceConfig {
  suggestions: string[];
}

export const ConfigureExperience: FC<{
  experienceConfig: WebWidgetExperienceConfig;
  setExperienceConfig: (config: WebWidgetExperienceConfig) => void;
}> = ({ experienceConfig, setExperienceConfig }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const onChangeGreeting = (v: string) =>
    setExperienceConfig({ ...experienceConfig, greeting: v });
  const onChangeSuggestions = (suggestions: string[]) =>
    setExperienceConfig({ ...experienceConfig, suggestions });
  const onChangeMessageOnError = (v: string) =>
    setExperienceConfig({ ...experienceConfig, messageOnError: v });
  const onChangeIdealMessage = (v: string) =>
    setExperienceConfig({ ...experienceConfig, idealMessage: v });
  const onChangeIdealTimeout = (v: string) =>
    setExperienceConfig({ ...experienceConfig, idealTimeout: v });
  const onChangeMaxCallDuration = (v: string) =>
    setExperienceConfig({ ...experienceConfig, maxCallDuration: v });
  const onChangeIdleTimeoutBackoffTimes = (v: string) =>
    setExperienceConfig({ ...experienceConfig, idleTimeoutBackoffTimes: v });

  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <div className="px-6 py-8 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        {/* Left: section label */}
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            General Experience
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            Define how the widget greets users and handles sessions.
          </p>
        </div>

        {/* Right: fields */}
        <div className="space-y-6 max-w-xl">
          <FieldSet>
            <FormLabel>Greeting</FormLabel>
            <Textarea
              row={3}
              value={experienceConfig.greeting || ''}
              onChange={e => onChangeGreeting(e.target.value)}
              placeholder="Describe your agent so users know how to use it. This will appear as a welcome message."
            />
          </FieldSet>

          <FieldSet>
            <FormLabel>Quickstart Questions</FormLabel>
            <ConfigSelect
              options={experienceConfig.suggestions}
              label="Add new question"
              placeholder="Add a frequently asked question."
              onChange={onChangeSuggestions}
            />
          </FieldSet>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <ChevronDown
              className={cn(
                'w-4 h-4 transition-transform duration-200',
                showAdvanced && 'rotate-180',
              )}
              strokeWidth={2}
            />
            {showAdvanced ? 'Hide' : 'Show'} advanced settings
          </button>

          {showAdvanced && (
            <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <FieldSet>
                <FormLabel>Error Message</FormLabel>
                <Input
                  placeholder="Message sent to the user when an error occurs"
                  value={experienceConfig.messageOnError || ''}
                  onChange={e => onChangeMessageOnError(e.target.value)}
                />
              </FieldSet>

              <FieldSet>
                <FormLabel>Idle Silence Timeout (Milliseconds)</FormLabel>
                <div className="flex items-center gap-3">
                  <Slider
                    className="flex-1"
                    min={3000}
                    max={10000}
                    step={500}
                    value={
                      experienceConfig.idealTimeout
                        ? parseInt(experienceConfig.idealTimeout)
                        : undefined
                    }
                    onSlide={v => onChangeIdealTimeout(v.toString())}
                  />
                  <Input
                    className="w-20 shrink-0"
                    value={experienceConfig.idealTimeout}
                    onChange={e => onChangeIdealTimeout(e.target.value)}
                  />
                </div>
                <InputHelper>
                  Duration of silence after which Rapida will prompt the user
                  (3000–10000 ms).
                </InputHelper>
              </FieldSet>

              <FieldSet>
                <FormLabel>Idle Timeout Backoff (Times)</FormLabel>
                <div className="flex items-center gap-3">
                  <Slider
                    className="flex-1"
                    min={0}
                    max={5}
                    step={1}
                    value={
                      experienceConfig.idleTimeoutBackoffTimes
                        ? parseInt(experienceConfig.idleTimeoutBackoffTimes)
                        : undefined
                    }
                    onSlide={v => onChangeIdleTimeoutBackoffTimes(v.toString())}
                  />
                  <Input
                    className="w-16 shrink-0"
                    value={experienceConfig.idleTimeoutBackoffTimes}
                    onChange={e =>
                      onChangeIdleTimeoutBackoffTimes(e.target.value)
                    }
                  />
                </div>
                <InputHelper>
                  How many times the idle timeout multiplies before ending the
                  session.
                </InputHelper>
              </FieldSet>

              <FieldSet>
                <FormLabel>Idle Message</FormLabel>
                <Input
                  placeholder="Message spoken when the user hasn't responded"
                  value={experienceConfig.idealMessage}
                  onChange={e => onChangeIdealMessage(e.target.value)}
                />
              </FieldSet>

              <FieldSet>
                <FormLabel>Maximum Session Duration (Minutes)</FormLabel>
                <div className="flex items-center gap-3">
                  <Slider
                    className="flex-1"
                    min={3}
                    max={15}
                    step={1}
                    value={
                      experienceConfig.maxCallDuration
                        ? parseInt(experienceConfig.maxCallDuration)
                        : undefined
                    }
                    onSlide={v => onChangeMaxCallDuration(v.toString())}
                  />
                  <Input
                    className="w-16 shrink-0"
                    value={experienceConfig.maxCallDuration}
                    onChange={e => onChangeMaxCallDuration(e.target.value)}
                  />
                </div>
                <InputHelper>
                  Maximum session length before the call is automatically ended
                  (3–15 min).
                </InputHelper>
              </FieldSet>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
