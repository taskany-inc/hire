import { SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { Modal, ModalContent, ModalHeader, FormTitle, Button } from '@taskany/bricks';

import { useSectionCancelMutation } from '../../modules/sectionHooks';
import { pageHrefs } from '../../utils/paths';
import { Stack } from '../Stack';
import { FormTextArea } from '../FormTextArea';

import { tr } from './SectionCancelationConfirmation.i18n';

type SectionCancelationConfirmationProps = {
    isOpen: boolean;
    onClose: () => void;
    sectionId: number;
    interviewId: number;
    calendarSlotId?: string | null;
};

export const SectionCancelationConfirmation = ({
    isOpen,
    onClose,
    sectionId,
    interviewId,
    calendarSlotId,
}: SectionCancelationConfirmationProps) => {
    const router = useRouter();

    const sectionCancelMutation = useSectionCancelMutation();

    const onSubmit: SubmitHandler<{ cancelComment?: string }> = async (data) => {
        const { cancelComment } = data;

        await sectionCancelMutation.mutateAsync({ sectionId, interviewId, cancelComment, calendarSlotId }).then(() => {
            router.push(pageHrefs.interview(interviewId));
            onClose();
        });
    };

    const {
        handleSubmit,
        register,
        formState: { isSubmitting },
    } = useForm<{ cancelComment?: string }>();

    return (
        <Modal visible={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <ModalHeader>
                    <FormTitle>{tr('Commentary on section cancellation')}</FormTitle>
                </ModalHeader>
                <ModalContent>
                    <Stack direction="column" gap={24} justifyItems="start">
                        <FormTextArea
                            label={tr('Comment')}
                            placeholder={tr('Commentary on section cancellation')}
                            rows={3}
                            {...register('cancelComment')}
                        />
                    </Stack>
                </ModalContent>
                <Stack direction="row" gap={10} justifyContent="flex-start" style={{ margin: 12 }}>
                    <Button onClick={onClose} text={tr('Cancel')} />
                    <Button type="submit" view="primary" disabled={isSubmitting} text={tr('Save')} />
                </Stack>
            </form>
        </Modal>
    );
};
