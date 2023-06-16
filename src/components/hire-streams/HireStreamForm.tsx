import { HireStream } from '@prisma/client';
import { VFC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { CreateHireStream, createHireStreamSchema } from '../../backend/modules/hire-streams/hire-stream-types';
import { useCreateHireStreamMutation } from '../../hooks/hire-streams-hooks';
import { FormContainer } from '../FormContainer/FormContainer';
import { FormInput } from '../FormInput/FormInput';

type HireStreamFormProps = {
    afterSubmit: (hireStream: HireStream) => void;
};

export const HireStreamForm: VFC<HireStreamFormProps> = ({ afterSubmit }) => {
    const {
        handleSubmit,
        register,
        formState: { errors, isSubmitting, isSubmitSuccessful },
    } = useForm<CreateHireStream>({ resolver: zodResolver(createHireStreamSchema) });
    const createHireStream = useCreateHireStreamMutation();

    const onSubmit = handleSubmit((values) => createHireStream.mutateAsync(values).then(afterSubmit));
    const { ref: refName, ...restName } = register('name');

    return (
        <FormContainer
            submitButtonText="Add hire stream"
            onSubmitButton={onSubmit}
            submitButtonDisabled={isSubmitting || isSubmitSuccessful}
        >
            <FormInput label="Name" helperText={errors.name?.message} forwardRef={refName} {...restName} />
        </FormContainer>
    );
};
