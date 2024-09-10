import { HireStream } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Button,
    Card,
    CardContent,
    FormControl,
    FormControlError,
    FormControlInput,
    FormControlLabel,
} from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';

import { CreateHireStream, createHireStreamSchema } from '../../modules/hireStreamTypes';
import { useCreateHireStreamMutation } from '../../modules/hireStreamsHooks';
import { FormActions } from '../FormActions/FormActions';

import { tr } from './HireStreamForm.i18n';
import s from './HireStreamForm.module.css';

interface HireStreamFormProps {
    afterSubmit: (hireStream: HireStream) => void;
}

export const HireStreamForm = ({ afterSubmit }: HireStreamFormProps) => {
    const {
        handleSubmit,
        register,
        formState: { errors, isSubmitting, isSubmitSuccessful },
    } = useForm<CreateHireStream>({
        resolver: zodResolver(createHireStreamSchema),
    });
    const createHireStream = useCreateHireStreamMutation();

    const onSubmit = handleSubmit((values) => createHireStream.mutateAsync(values).then(afterSubmit));

    return (
        <form onSubmit={onSubmit}>
            <Card>
                <CardContent className={s.HireStreamFormCard}>
                    <FormControl>
                        <FormControlLabel>{tr('Name')}</FormControlLabel>
                        <FormControlInput {...register('name')} autoComplete="off" />
                        {nullable(errors.name, (e) => (
                            <FormControlError error={e} />
                        ))}
                    </FormControl>

                    <FormActions>
                        <Button
                            disabled={isSubmitting || isSubmitSuccessful}
                            view="primary"
                            type="submit"
                            text={tr('Add hire stream')}
                        />
                    </FormActions>
                </CardContent>
            </Card>
        </form>
    );
};
