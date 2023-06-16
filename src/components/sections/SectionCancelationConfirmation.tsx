import { SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { Modal, ModalContent, ModalHeader, FormTitle, Button } from '@taskany/bricks';

import { Stack } from '../layout/Stack';
import { useSectionCancelMutation } from '../../hooks/section-hooks';
import { pageHrefs } from '../../utils/paths';
import { FormTextArea } from '../FormInput/FormTextArea';

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
    const { ref: refCancelComment, ...restCancelComment } = register('cancelComment');

    return (
        <Modal visible={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <ModalHeader>
                    <FormTitle>Commentary on section cancellation</FormTitle>
                </ModalHeader>
                <ModalContent>
                    <Stack direction="column" gap={24} justifyItems="start">
                        <FormTextArea
                            label="Comment"
                            placeholder="Commentary on section cancellation"
                            rows={3}
                            {...register('cancelComment')}
                        />
                    </Stack>
                </ModalContent>
                <Stack direction="row" gap={10} justifyContent="flex-start" style={{ margin: 12 }}>
                    <Button onClick={onClose} text="Cancel" />
                    <Button type="submit" view="primary" disabled={isSubmitting} text="Save" />
                </Stack>
            </form>
        </Modal>
    );
};
