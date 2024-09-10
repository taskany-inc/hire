import { SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import {
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    Text,
    Textarea,
    FormControlError,
    FormControl,
} from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';

import { useSectionCancelMutation } from '../../modules/sectionHooks';
import { pageHrefs } from '../../utils/paths';
import { FormActions } from '../FormActions/FormActions';

import { tr } from './SectionCancelationConfirmation.i18n';
import s from './SectionCancelationConfirmation.module.css';

interface SectionCancelationConfirmationProps {
    isOpen: boolean;
    onClose: () => void;
    sectionId: number;
    interviewId: number;
    calendarSlotId?: string | null;
}

export const SectionCancelationConfirmation = ({
    isOpen,
    onClose,
    sectionId,
    interviewId,
    calendarSlotId,
}: SectionCancelationConfirmationProps) => {
    const router = useRouter();

    const sectionCancelMutation = useSectionCancelMutation();

    const onSubmit: SubmitHandler<{ cancelComment: string }> = async (data) => {
        const { cancelComment } = data;

        await sectionCancelMutation.mutateAsync({ sectionId, interviewId, cancelComment, calendarSlotId }).then(() => {
            router.push(pageHrefs.interview(interviewId));
            onClose();
        });
    };

    const {
        handleSubmit,
        register,
        formState: { isSubmitting, errors },
    } = useForm<{ cancelComment: string }>();

    return (
        <Modal visible={isOpen} onClose={onClose} width={600}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <ModalHeader>
                    <Text size="l" weight="bold">
                        {tr('Commentary on section cancellation')}
                    </Text>
                </ModalHeader>
                <ModalContent className={s.SectionCancelationConfirmationContent}>
                    <FormControl>
                        <Textarea
                            placeholder={tr('Commentary on section cancellation')}
                            {...register('cancelComment', {
                                required: { value: true, message: tr('Required field') },
                            })}
                            height={150}
                        />
                        {nullable(errors.cancelComment, (e) => (
                            <FormControlError error={e} />
                        ))}
                    </FormControl>

                    <FormActions>
                        <Button onClick={onClose} text={tr('Cancel')} />
                        <Button type="submit" view="primary" disabled={isSubmitting} text={tr('Save')} />
                    </FormActions>
                </ModalContent>
            </form>
        </Modal>
    );
};
