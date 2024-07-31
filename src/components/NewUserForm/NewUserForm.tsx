import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useDebounce } from 'use-debounce';
import styled from 'styled-components';
import { Form, Fieldset, FormAction, FormActions, FormCard } from '@taskany/bricks';
import { Button } from '@taskany/bricks/harmony';

import { CreateUser } from '../../modules/userTypes';
import { useExternalUserSearch } from '../../modules/externalUserHooks';
import { Paths } from '../../utils/paths';
import { Autocomplete } from '../Autocomplete/Autocomplete';
import { useCreateUserMutation } from '../../modules/userHooks';

import { tr } from './NewUserForm.i18n';

const StyledFormCard = styled(FormCard)`
    width: 500px;
`;

export const NewUserForm = () => {
    const {
        handleSubmit,
        watch,
        setValue,
        formState: { isSubmitting, isSubmitSuccessful },
    } = useForm<CreateUser>();

    const router = useRouter();
    const createUserMutation = useCreateUserMutation();

    const [name] = useDebounce(watch('name'), 300);
    const usersByNameQuery = useExternalUserSearch(name);
    const usersByName = useMemo(() => usersByNameQuery.data?.map((u) => u.fullName) ?? [], [usersByNameQuery.data]);
    const [email] = useDebounce(watch('email'), 300);
    const usersByEmailQuery = useExternalUserSearch(email);
    const usersByEmail = useMemo(() => usersByEmailQuery.data?.map((u) => u.email) ?? [], [usersByEmailQuery.data]);

    const onSubmit = handleSubmit((values) =>
        createUserMutation
            .mutateAsync({
                name: values.name,
                email: values.email.toLowerCase().trim(),
            })
            .then(() => router.push(Paths.CANDIDATES)),
    );

    return (
        <StyledFormCard>
            <Form onSubmit={onSubmit}>
                <Fieldset>
                    <Autocomplete
                        label={tr('Full name')}
                        options={usersByName}
                        onChange={(name) => {
                            const user = usersByNameQuery.data?.find((u) => u.fullName === name);

                            if (user) {
                                setValue('name', user.fullName);
                                setValue('email', user.email);
                            }
                        }}
                        onInputChange={(value) => setValue('name', value)}
                    />
                    <Autocomplete
                        label={tr('Email')}
                        options={usersByEmail}
                        onChange={(email) => {
                            const user = usersByEmailQuery.data?.find((u) => u.email === email);

                            if (user) {
                                setValue('name', user.fullName);
                                setValue('email', user.email);
                            }
                        }}
                        onInputChange={(value) => setValue('email', value)}
                    />
                </Fieldset>
                <FormActions flat="top">
                    <FormAction left inline></FormAction>
                    <FormAction right inline>
                        <Button
                            disabled={isSubmitting || isSubmitSuccessful}
                            size="s"
                            view="primary"
                            type="submit"
                            text={tr('Add user')}
                        />
                    </FormAction>
                </FormActions>
            </Form>
        </StyledFormCard>
    );
};
