import { IBlueBGButton, ICancelButton } from '@/app/components/form/button';
import { ErrorMessage } from '@/app/components/form/error-message';
import { GenericModal, ModalProps } from '@/app/components/base/modal';
import { useRapidaStore } from '@/hooks';
import React, { useEffect, useState } from 'react';
import { FieldSet } from '@/app/components/form/fieldset';
import { Input } from '@/app/components/form/input';
import { FormLabel } from '@/app/components/form-label';
import { ModalBody } from '@/app/components/base/modal/modal-body';
import { ModalFooter } from '@/app/components/base/modal/modal-footer';
import { ModalHeader } from '@/app/components/base/modal/modal-header';
import { ModalFitHeightBlock } from '@/app/components/blocks/modal-fit-height-block';
import { ModalTitleBlock } from '@/app/components/blocks/modal-title-block';
import { Textarea } from '@/app/components/form/textarea';

interface UpdateDescriptionDialogProps extends ModalProps {
  title?: string;
  name?: string;
  description?: string;
  onUpdateDescription: (
    name: string,
    description: string,
    onError: (err: string) => void,
    onSuccess: () => void,
  ) => void;
}

export function UpdateDescriptionDialog(props: UpdateDescriptionDialogProps) {
  const [error, setError] = useState('');
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const rapidaStore = useRapidaStore();

  useEffect(() => {
    if (props.name) setName(props.name);
    if (props.description) setDescription(props.description);
  }, [props.name, props.description]);

  const onUpdateDescription = () => {
    rapidaStore.showLoader('overlay');
    props.onUpdateDescription(
      name,
      description,
      err => {
        rapidaStore.hideLoader();
        setError(err);
      },
      () => {
        rapidaStore.hideLoader();
        props.setModalOpen(false);
      },
    );
  };

  return (
    <GenericModal modalOpen={props.modalOpen} setModalOpen={props.setModalOpen}>
      <ModalFitHeightBlock className="w-[592px]">
        <ModalHeader onClose={() => props.setModalOpen(false)}>
          <ModalTitleBlock>{props.title}</ModalTitleBlock>
        </ModalHeader>

        <ModalBody>
          <FieldSet>
            <FormLabel>Name</FormLabel>
            <Input
              name="usecase"
              value={name}
              placeholder="e.g. emotion detector"
              onChange={e => setName(e.target.value)}
            />
          </FieldSet>

          <FieldSet>
            <FormLabel>Description</FormLabel>
            <Textarea
              rows={4}
              value={description}
              placeholder="Provide a readable description and how to use it."
              onChange={v => setDescription(v.target.value)}
            />
          </FieldSet>

          <ErrorMessage message={error} />
        </ModalBody>

        <ModalFooter>
          <ICancelButton onClick={() => props.setModalOpen(false)}>
            Cancel
          </ICancelButton>
          <IBlueBGButton
            type="button"
            onClick={onUpdateDescription}
            isLoading={rapidaStore.loading}
          >
            Save changes
          </IBlueBGButton>
        </ModalFooter>
      </ModalFitHeightBlock>
    </GenericModal>
  );
}
