import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useDebounce } from 'use-debounce';

import { CreateUser } from '../../backend/modules/user/user-types';
import { useExternalUserSearch } from '../../hooks/external-user-hooks';
import { useCreateUserMutation } from '../../hooks/user-hooks';
import { Paths } from '../../utils/paths';
import { FormContainer } from '../FormContainer/FormContainer';
import { FormAutoComplete } from '../FormInput/FormAutocomplete';

import { tr } from './users.i18n';

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
        <FormContainer
            submitButtonText={tr('Add user')}
            onSubmitButton={onSubmit}
            submitButtonDisabled={isSubmitting || isSubmitSuccessful}
        >
            <FormAutoComplete
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
            <FormAutoComplete
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
        </FormContainer>
    );
};
