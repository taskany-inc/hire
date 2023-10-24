import { VFC } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Candidate, OutstaffVendor } from '@prisma/client';
import { useRouter } from 'next/router';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { UpdateCandidate, CreateCandidate } from '../../backend/modules/candidate/candidate-types';
import { generatePath, Paths } from '../../utils/paths';
import { useNullableDropdownFieldOptions } from '../inputs/DropdownField';
import { validationRules } from '../../utils/validation-rules';
import { useCandidateCreateMutation, useCandidateUpdateMutation } from '../../hooks/candidate-hooks';
import { FormContainer } from '../FormContainer/FormContainer';
import { FormInput } from '../FormInput/FormInput';
import { FormPhoneInput } from '../FormInput/FormPhoneInput';
import { Select } from '../Select';
import config from '../../backend/config';

import { tr } from './candidates.i18n';

type AddOrUpdateCandidateProps = {
    variant: 'new' | 'update';
    onSave?: () => void;
    candidate?: Candidate;
    outstaffVendors: OutstaffVendor[];
};

type FormValues = Omit<CreateCandidate, 'outstaffVendorId'> & {
    outstaffVendorId: string | null;
};

const schema = z.object({
    email: z.string().nullish(),
    name: z.string({ required_error: tr('Obligatory field') }),
    outstaffVendorId: z.string().nullish(),
    phone: z.string().nullish(),
});

export const AddOrUpdateCandidate: VFC<AddOrUpdateCandidateProps> = (props) => {
    const { variant, onSave, candidate, outstaffVendors } = props;

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
        if (!candidate) {
            return;
        }

        const data: UpdateCandidate = {
            candidateId: candidate.id,
            name: values.name,
            email: values.email?.toLowerCase().trim(),
            phone: values.phone,
            outstaffVendorId: values.outstaffVendorId && prepareValueForSubmit(values.outstaffVendorId),
        };

        await candidateUpdateMutation.mutateAsync(data);

        if (onSave) onSave();
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

        router.push(generatePath(Paths.CANDIDATE, { candidateId })).then();

        if (onSave) onSave();
    };

    const onSubmit: SubmitHandler<FormValues> = variant === 'new' ? create : update;
    const onOutstaffVendorIdChange = (outstaffVendorId: string) => setValue('outstaffVendorId', outstaffVendorId);

    const { ref: refName, ...restName } = register('name', validationRules.nonEmptyString);
    const { ref: refEmail, ...restEmail } = register('email', {
        required: false,
    });

    return (
        <FormContainer
            submitButtonText={variant === 'new' ? tr('Add candidate') : tr('Save candidate')}
            onSubmitButton={handleSubmit(onSubmit)}
            submitButtonDisabled={isSubmitting}
        >
            <FormInput label={tr('Full name')} helperText={errors.name?.message} forwardRef={refName} {...restName} />
            <Select
                options={options}
                value={watch('outstaffVendorId')}
                onChange={onOutstaffVendorIdChange}
                text={tr('Employment')}
            />
            <FormInput label={tr('Email')} helperText={errors.email?.message} forwardRef={refEmail} {...restEmail} />
            <FormPhoneInput
                name="phone"
                control={control}
                label={tr('Phone number')}
                defaultValue={candidate?.phone || ''}
                options={{ required: false }}
            />
        </FormContainer>
    );
};
