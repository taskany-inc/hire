import { ChangeEvent } from 'react';
import { HireStream } from '@prisma/client';
import { keyPredictor } from '@taskany/bricks';
import { Button, FormControlInput, Modal, ModalContent, ModalCross, ModalHeader } from '@taskany/bricks/harmony';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
    CreateHireStream,
    EditHireStream,
    createHireStreamSchema,
    editHireStreamSchema,
} from '../../modules/hireStreamTypes';
import { useCreateHireStreamMutation, useEditHireStreamMutation } from '../../modules/hireStreamsHooks';
import { FormControl } from '../FormControl/FormControl';
import { FormActions } from '../FormActions/FormActions';

import { tr } from './HireStreamFormPopup.i18n';
import s from './HireStreamFormPopup.module.css';

interface HireStreamEditPopupProps {
    visible: boolean;
    onClose: VoidFunction;
    hireStream?: HireStream;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseNullishNumber = (v: any) => (v ? parseInt(v, 10) : null);

export const HireStreamFormPopup = ({ visible, onClose, hireStream }: HireStreamEditPopupProps) => {
    const createHireStream = useCreateHireStreamMutation();
    const editHireStream = useEditHireStreamMutation();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<EditHireStream | CreateHireStream>({
        defaultValues: hireStream,
        resolver: zodResolver(hireStream ? editHireStreamSchema : createHireStreamSchema),
    });

    const closeAndReset = () => {
        reset(hireStream);
        onClose();
    };

    const onSubmit = async (data: EditHireStream | CreateHireStream) => {
        const result = hireStream
            ? await editHireStream.mutateAsync(data as EditHireStream)
            : await createHireStream.mutateAsync(data as CreateHireStream);
        reset(result);
        onClose();
    };

    return (
        <Modal onClose={closeAndReset} visible={visible} width={500}>
            <ModalHeader>
                <ModalCross onClick={closeAndReset} />
                {hireStream ? tr('Edit hire stream') : tr('New hire stream')}
            </ModalHeader>
            <ModalContent>
                <form onSubmit={handleSubmit(onSubmit)} className={s.HireStreamEditPopupForm}>
                    <FormControl label={tr('Code')} error={errors.name}>
                        <FormControlInput {...register('name')} />
                    </FormControl>

                    <FormControl label={tr('Display name')} error={errors.displayName}>
                        <FormControlInput
                            {...register('displayName', {
                                onChange: (e: ChangeEvent<HTMLInputElement>) => {
                                    setValue('name', keyPredictor(e.target.value), { shouldValidate: true });
                                },
                            })}
                        />
                    </FormControl>

                    <FormControl label={tr('Weekly limit for interviewers')} error={errors.weekLimit}>
                        <FormControlInput
                            type="number"
                            min={1}
                            {...register('weekLimit', { setValueAs: parseNullishNumber })}
                        />
                    </FormControl>

                    <FormControl label={tr('Daily limit for interviewers')} error={errors.dayLimit}>
                        <FormControlInput
                            type="number"
                            min={1}
                            {...register('dayLimit', { setValueAs: parseNullishNumber })}
                        />
                    </FormControl>

                    <FormActions>
                        <Button disabled={isSubmitting} size="s" view="primary" type="submit" text={tr('Save')} />
                    </FormActions>
                </form>
            </ModalContent>
        </Modal>
    );
};
