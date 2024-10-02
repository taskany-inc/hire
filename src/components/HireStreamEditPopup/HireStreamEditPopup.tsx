import { HireStream } from '@prisma/client';
import { Button, FormControlInput, Modal, ModalContent, ModalCross, ModalHeader } from '@taskany/bricks/harmony';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { EditHireStream, editHireStreamSchema } from '../../modules/hireStreamTypes';
import { useEditHireStreamMutation } from '../../modules/hireStreamsHooks';
import { FormControl } from '../FormControl/FormControl';
import { FormActions } from '../FormActions/FormActions';

import { tr } from './HireStreamEditPopup.i18n';
import s from './HireStreamEditPopup.module.css';

interface HireStreamEditPopupProps {
    visible: boolean;
    onClose: VoidFunction;
    hireStream: HireStream;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseNullishNumber = (v: any) => (v ? parseInt(v, 10) : null);

export const HireStreamEditPopup = ({ visible, onClose, hireStream }: HireStreamEditPopupProps) => {
    const editHireStream = useEditHireStreamMutation();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<EditHireStream>({
        defaultValues: hireStream,
        resolver: zodResolver(editHireStreamSchema),
    });

    const closeAndReset = () => {
        reset(hireStream);
        onClose();
    };

    const onSubmit = async (data: EditHireStream) => {
        const result = await editHireStream.mutateAsync(data);
        reset(result);
        onClose();
    };

    return (
        <Modal onClose={closeAndReset} visible={visible} width={500}>
            <ModalHeader>
                <ModalCross onClick={closeAndReset} />
                {tr('Edit hire stream')}
            </ModalHeader>
            <ModalContent>
                <form onSubmit={handleSubmit(onSubmit)} className={s.HireStreamEditPopupForm}>
                    <FormControl label={tr('Name')} error={errors.name}>
                        <FormControlInput {...register('name')} />
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
