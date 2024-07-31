import { VFC } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Candidate, OutstaffVendor } from '@prisma/client';
import { useRouter } from 'next/router';
import { z } from 'zod';
import styled from 'styled-components';
import { zodResolver } from '@hookform/resolvers/zod';
import { Fieldset, Form, FormAction, FormActions, FormCard, FormInput } from '@taskany/bricks';
import { Button } from '@taskany/bricks/harmony';

import { UpdateCandidate, CreateCandidate } from '../../modules/candidateTypes';
import { generatePath, Paths } from '../../utils/paths';
import {
    useCandidateCreateMutation,
    useCandidateUpdateMutation,
    useOutstaffVendors,
} from '../../modules/candidateHooks';
import config from '../../config';
import { useNullableDropdownFieldOptions } from '../DropdownField';
import { Select } from '../Select';
import { PhoneField } from '../PhoneField/PhoneField';

import { tr } from './AddOrUpdateCandidate.i18n';

type AddOrUpdateCandidateProps = {
    onSave?: (candidate: Candidate) => void;
} & (
    | {
          variant: 'new';
          candidate?: Partial<Omit<Candidate, 'createdAt' | 'updatedAt' | 'id'>>;
      }
    | {
          variant: 'update';
          candidate: Candidate;
      }
);

type FormValues = Omit<CreateCandidate, 'outstaffVendorId'> & {
    outstaffVendorId: string | null;
};

const schema = z.object({
    email: z.string().nullish(),
    name: z.string().min(3, tr('Name cannot be less than 3 characters')),
    outstaffVendorId: z.string().nullish(),
    phone: z.string().nullish(),
});

const StyledFormCard = styled(FormCard)`
    max-width: 700px;
`;

export const AddOrUpdateCandidate: VFC<AddOrUpdateCandidateProps> = (props) => {
    const { variant, onSave, candidate } = props;

    const outstaffVendorsQuery = useOutstaffVendors();
    const outstaffVendors = outstaffVendorsQuery.data ?? [];

    const router = useRouter();

    const candidateCreateMutation = useCandidateCreateMutation();
    const candidateUpdateMutation = useCandidateUpdateMutation();

    const { options, encodeInitialValue, prepareValueForSubmit } = useNullableDropdownFieldOptions<
        string,
        OutstaffVendor
    >(outstaffVendors, {
        dataItemToOption: ({ id, title }: OutstaffVendor) => ({
            text: title,
            value: id,
        }),
        additionalNullOptionTitle: config.defaultCandidateVendor,
    });

    const { outstaffVendorId, ...initialValues } = candidate ?? {};
    const {
        handleSubmit,
        register,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<Candidate>({
        defaultValues: {
            ...initialValues,
            outstaffVendorId:
                typeof outstaffVendorId !== 'undefined' ? encodeInitialValue(outstaffVendorId) : undefined,
        },
        resolver: zodResolver(schema),
    });

    const update: SubmitHandler<FormValues> = async (values) => {
        if (variant === 'new') {
            return;
        }

        const data: UpdateCandidate = {
            candidateId: candidate.id,
            name: values.name,
            email: values.email?.toLowerCase().trim(),
            phone: values.phone,
            outstaffVendorId: values.outstaffVendorId && prepareValueForSubmit(values.outstaffVendorId),
        };

        const result = await candidateUpdateMutation.mutateAsync(data);
        const candidateId = result.id;

        if (onSave) {
            onSave(result);
        } else {
            router.push(generatePath(Paths.CANDIDATE, { candidateId }));
        }
    };

    const create: SubmitHandler<FormValues> = async (values) => {
        if (values.email === '') values.email = undefined;

        if (values.email) values.email = values.email.toLowerCase().trim();

        const data: CreateCandidate = {
            ...values,
            outstaffVendorId: values.outstaffVendorId && prepareValueForSubmit(values.outstaffVendorId),
        };

        const result = await candidateCreateMutation.mutateAsync(data);
        const candidateId = result.id;

        if (onSave) {
            onSave(result);
        } else {
            router.push(generatePath(Paths.CANDIDATE, { candidateId })).then();
        }
    };

    const onSubmit: SubmitHandler<FormValues> = variant === 'new' ? create : update;
    const onOutstaffVendorIdChange = (outstaffVendorId: string) => setValue('outstaffVendorId', outstaffVendorId);

    return (
        <StyledFormCard>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Fieldset>
                    <FormInput
                        {...register('name')}
                        label={tr('Full name')}
                        autoComplete="off"
                        flat="bottom"
                        error={errors.name}
                    />
                    <FormInput
                        label={tr('Email')}
                        error={errors.email}
                        {...register('email')}
                        autoComplete="off"
                        flat="bottom"
                    />
                    <PhoneField
                        name="phone"
                        control={control}
                        defaultValue={candidate?.phone || ''}
                        options={{ required: false }}
                    />
                    <Select
                        options={options}
                        value={watch('outstaffVendorId')}
                        onChange={onOutstaffVendorIdChange}
                        text={tr('Employment')}
                    />
                </Fieldset>
                <FormActions flat="top">
                    <FormAction left inline></FormAction>
                    <FormAction right inline>
                        <Button
                            view="primary"
                            type="submit"
                            text={variant === 'new' ? tr('Add candidate') : tr('Save candidate')}
                            disabled={isSubmitting}
                        />
                    </FormAction>
                </FormActions>
            </Form>
        </StyledFormCard>
    );
};
