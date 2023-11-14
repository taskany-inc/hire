import { useCallback, useMemo, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { isNumber } from 'superjson/dist/is';
import z from 'zod';
import { useRouter } from 'next/router';
import { InterviewStatus, RejectReason } from '@prisma/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, ModalContent, ModalHeader, FormTitle, Button } from '@taskany/bricks';

import { useInterviewUpdateMutation } from '../../modules/interviewHooks';
import { Stack } from '../Stack';
import { generatePath, Paths } from '../../utils/paths';
import { Select } from '../Select';
import { FormTextArea } from '../FormTextArea';

import { tr } from './HireOrRejectConfirmation.i18n';

const errorMessage = tr('Required field, fill in this field or select a standard option');

const schema = z
    .object({
        standardOption: z.number({
            invalid_type_error: errorMessage,
        }),
    })
    .or(
        z.object({
            statusComment: z
                .string({
                    invalid_type_error: errorMessage,
                    required_error: errorMessage,
                })
                .min(3, { message: errorMessage }),
        }),
    );

type HireOrRejectConfirmationProps = {
    interviewId: number;
    status: InterviewStatus;
    isOpen: boolean;
    onClose: () => void;
    onSubmitSuccessful?: (status: InterviewStatus) => Promise<void>;
    rejectReasons: RejectReason[];
};

export const HireOrRejectConfirmation = ({
    interviewId,
    status,
    isOpen,
    onClose,
    onSubmitSuccessful,
    rejectReasons,
}: HireOrRejectConfirmationProps): JSX.Element => {
    const router = useRouter();

    const interviewUpdateMutation = useInterviewUpdateMutation();
    const {
        handleSubmit,
        register,
        watch,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<{ standardOption?: number | null; statusComment?: string }>({
        resolver: zodResolver(schema),
    });

    const handleOnClose = () => {
        reset({ standardOption: undefined, statusComment: undefined });
        onClose();
    };
    const standartOptions = rejectReasons.map((option, index) => ({
        text: option.text,
        value: index,
    }));

    const onSubmit: SubmitHandler<{
        standardOption?: number | null;
        statusComment?: string;
    }> = async (data) => {
        const { standardOption, statusComment } = data;
        const preparedStandardOption = (isNumber(standardOption) && standartOptions[standardOption].text) || '';
        const preparedStatusComment = preparedStandardOption || statusComment;

        await interviewUpdateMutation.mutateAsync({
            data: { interviewId, status, statusComment: preparedStatusComment },
            metadata: { createFinishInterviewEvent: true },
        });

        if (onSubmitSuccessful) {
            await onSubmitSuccessful(status);
        }

        reset({ standardOption: undefined, statusComment: undefined });

        const interviewLink = generatePath(Paths.INTERVIEW, { interviewId });

        // TODO: Achieve an update of the interview card without reloading the page?
        router.push(interviewLink);

        onClose();
    };

    const isVisibleAdditionalComment = !isNumber(watch('standardOption'));
    const onStandartOptionChange = (standartOptionId: number) => setValue('standardOption', standartOptionId);

    return (
        <Modal visible={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <ModalHeader>
                    <FormTitle>{tr('Commentary on the interview')}</FormTitle>
                </ModalHeader>
                <ModalContent>
                    <Stack direction="column" gap={24} justifyItems="start">
                        {status === InterviewStatus.REJECTED && (
                            <Select
                                value={watch('standardOption')}
                                label={tr('Standard Comment')}
                                text={standartOptions[0].text}
                                options={standartOptions}
                                onChange={onStandartOptionChange}
                            />
                        )}
                        {isVisibleAdditionalComment && (
                            <FormTextArea
                                label={tr('Comment')}
                                helperText={errors.statusComment?.message}
                                placeholder={tr('Commentary on the interview')}
                                rows={3}
                                {...register('statusComment')}
                            />
                        )}
                    </Stack>
                </ModalContent>
                <Stack direction="row" gap={10} justifyContent="flex-start" style={{ margin: 12 }}>
                    <Button onClick={handleOnClose} text={tr('Cancel')} />
                    <Button outline type="submit" view="primary" disabled={isSubmitting} text={tr('Save')} />
                </Stack>
            </form>
        </Modal>
    );
};

export const useHireOrRejectConfirmation = (
    interviewId: number,
    rejectReasons: RejectReason[],
    passProps: Partial<HireOrRejectConfirmationProps> = {},
) => {
    const [status, setStatus] = useState<InterviewStatus | null>(null);

    const show = useCallback((statusToConfirm: InterviewStatus) => {
        setStatus(statusToConfirm);
    }, []);

    const hide = useCallback(() => setStatus(null), []);

    return useMemo(
        () => ({
            show,
            props: {
                interviewId,
                status: status ?? InterviewStatus.NEW,
                isOpen: !!status,
                onClose: hide,
                rejectReasons,
                ...passProps,
            },
        }),
        [show, interviewId, status, hide, passProps, rejectReasons],
    );
};
