import { Knowledge } from '@rapidaai/react';
import { useCredential } from '@/hooks/use-credential';
import { useKnowledgePageStore } from '@/hooks/use-knowledge-page-store';
import { Renew, Launch } from '@carbon/icons-react';
import { FC, useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast/headless';
import { ComboBox, Button } from '@carbon/react';

interface KnowledgeDropdownProps {
  className?: string;
  currentKnowledge?: string;
  onChangeKnowledge?: (k: Knowledge) => void;
}

export const KnowledgeDropdown: FC<KnowledgeDropdownProps> = props => {
  const [userId, token, projectId] = useCredential();
  const knowledgeActions = useKnowledgePageStore();
  const [, setLoading] = useState(false);

  const showLoader = () => setLoading(true);
  const hideLoader = () => setLoading(false);

  const onError = useCallback((err: string) => {
    hideLoader();
    toast.error(err);
  }, []);

  const onSuccess = useCallback((data: Knowledge[]) => {
    hideLoader();
  }, []);

  const getKnowledges = useCallback((projectId, token, userId) => {
    showLoader();
    knowledgeActions.getAllKnowledge(projectId, token, userId, onError, onSuccess);
  }, []);

  useEffect(() => {
    if (props.currentKnowledge) {
      knowledgeActions.addCriteria('id', props.currentKnowledge, 'or');
    }
    getKnowledges(projectId, token, userId);
  }, [
    projectId,
    knowledgeActions.page,
    knowledgeActions.pageSize,
    JSON.stringify(knowledgeActions.criteria),
    props.currentKnowledge,
  ]);

  const selectedItem = knowledgeActions.knowledgeBases.find(
    x => x.getId() === props.currentKnowledge,
  ) || null;

  return (
    <div className="flex items-end gap-1">
      <div className="flex-1">
        <ComboBox
          id="knowledge-dropdown"
          titleText="Knowledge"
          placeholder="Search and select knowledge"
          items={knowledgeActions.knowledgeBases}
          selectedItem={selectedItem}
          itemToString={(item: Knowledge | null) => item?.getName() || ''}
          onChange={({ selectedItem }: any) => {
            if (selectedItem && props.onChangeKnowledge) {
              props.onChangeKnowledge(selectedItem);
            }
          }}
          onInputChange={(inputValue: string) => {
            if (inputValue && inputValue.trim() !== '') {
              knowledgeActions.addCriteria('name', inputValue, 'like');
            } else {
              knowledgeActions.removeCriteria('name');
            }
          }}
        />
      </div>
      <Button
        hasIconOnly
        renderIcon={Renew}
        iconDescription="Refresh"
        kind="ghost"
        size="md"
        onClick={() => getKnowledges(projectId, token, userId)}
      />
      <Button
        hasIconOnly
        renderIcon={Launch}
        iconDescription="Create knowledge"
        kind="ghost"
        size="md"
        onClick={() => window.open('/knowledge/create-knowledge', '_blank')}
      />
    </div>
  );
};
