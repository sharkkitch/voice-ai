import { FieldSet } from '@/app/components/form/fieldset';
import React, { FC } from 'react';
import { CloseIcon } from '@/app/components/Icon/Close';
import { Input } from '@/app/components/form/input';
import { InputHelper } from '@/app/components/input-helper';
import { FormLabel } from '@/app/components/form-label';

/**
 *
 */
interface TagInputProps {
  tags: string[];
  addTag: (string) => void;
  removeTag: (string) => void;
  allTags: Array<string>;
  className?: string;
}

/**
 *
 * @param param0
 * @returns
 */
export const TagInput: FC<TagInputProps> = ({
  tags,
  addTag,
  removeTag,
  allTags,
  className,
}) => {
  //   all the tags

  //
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {tags.map((t, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
          >
            {t}
            <CloseIcon
              className="h-3 w-3 cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              stroke="currentColor"
              onClick={() => removeTag(t)}
            />
          </span>
        ))}
      </div>
      <FieldSet>
        <FormLabel>Tags (Optional)</FormLabel>
        <Input
          type="text"
          className={className}
          placeholder="Add tags"
          onKeyDown={e => {
            if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
              addTag(e.currentTarget.value.trim());
              e.currentTarget.value = '';
            }
          }}
        />

        <InputHelper>
          Add tags to organize and locate items more efficiently. Separate tags
          with commas and press Enter to add them.
        </InputHelper>
      </FieldSet>
    </div>
  );
};
