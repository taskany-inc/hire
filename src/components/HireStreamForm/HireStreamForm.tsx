import { HireStream } from '@prisma/client';
import { VFC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Fieldset, Form, FormAction, FormActions, FormCard, FormInput } from '@taskany/bricks';
import styled from 'styled-components';
import { Button } from '@taskany/bricks/harmony';

import { CreateHireStream, createHireStreamSchema } from '../../modules/hireStreamTypes';
import { useCreateHireStreamMutation } from '../../modules/hireStreamsHooks';

import { tr } from './HireStreamForm.i18n';

const StyledFormCard = styled(FormCard)`
    width: 500px;
`;

interface HireStreamFormProps {
    afterSubmit: (hireStream: HireStream) => void;
}

export const HireStreamForm: VFC<HireStreamFormProps> = ({ afterSubmit }) => {
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
        <StyledFormCard>
            <Form onSubmit={onSubmit}>
                <Fieldset>
                    <FormInput
                        label={tr('Name')}
                        error={errors.name}
                        {...register('name')}
                        autoComplete="off"
                        flat="bottom"
                    />
                </Fieldset>
                <FormActions flat="top">
                    <FormAction left inline></FormAction>
                    <FormAction right inline>
                        <Button
                            disabled={isSubmitting || isSubmitSuccessful}
                            view="primary"
                            type="submit"
                            text={tr('Add hire stream')}
                        />
                    </FormAction>
                </FormActions>
            </Form>
        </StyledFormCard>
    );
};
