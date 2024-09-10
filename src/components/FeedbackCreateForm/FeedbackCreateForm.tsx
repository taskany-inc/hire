import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { nullable } from '@taskany/bricks';
import * as Sentry from '@sentry/nextjs';
import {
    Button,
    FormControl,
    FormControlError,
    FormControlInput,
    FormControlLabel,
    ModalContent,
    Textarea,
} from '@taskany/bricks/harmony';

import { createFeedbackSchema, CreateFeedback } from '../../modules/feedbackTypes';
import { trpc } from '../../trpc/trpcClient';
import { FormActions } from '../FormActions/FormActions';

import { tr } from './FeedbackCreateForm.i18n';
import s from './FeedbackCreateForm.module.css';

interface FeedbackCreateFormProps {
    onClose: () => void;
}

const FeedbackCreateForm = ({ onClose }: FeedbackCreateFormProps) => {
    const [formBusy, setFormBusy] = useState(false);
    const createMutation = trpc.feedback.create.useMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateFeedback>({
        resolver: zodResolver(createFeedbackSchema),
    });

    const onPending = useCallback(
        async (form: CreateFeedback) => {
            setFormBusy(true);
            const res = await createMutation.mutateAsync({
                title: form.title,
                description: form.description,
                href: window.location.href,
            });

            if (res) {
                onClose();
            }

            setFormBusy(false);
        },

        [createMutation, onClose],
    );

    const onError = useCallback((err: typeof errors) => {
        Sentry.captureException(err);
    }, []);

    return (
        <ModalContent>
            <form onSubmit={handleSubmit(onPending, onError)} className={s.FeedbackCreateForm}>
                <FormControl>
                    <FormControlLabel>{tr('Feedback title')}</FormControlLabel>
                    <FormControlInput {...register('title')} />
                    {nullable(errors.title, (e) => (
                        <FormControlError error={e} />
                    ))}
                </FormControl>

                <Textarea
                    {...register('description')}
                    height={100}
                    placeholder={tr("Feedback description. Say anything what's on your mind")}
                />

                <FormActions>
                    <Button text={tr('Cancel')} onClick={onClose} />
                    <Button view="primary" type="submit" text={tr('Send feedback')} disabled={formBusy} />
                </FormActions>
            </form>
        </ModalContent>
    );
};

export default FeedbackCreateForm;
