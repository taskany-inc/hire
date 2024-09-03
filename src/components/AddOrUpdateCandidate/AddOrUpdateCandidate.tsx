import { ChangeEvent, useState, VFC } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Candidate } from '@prisma/client';
import { useRouter } from 'next/router';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { gray8 } from '@taskany/colors';
import { Fieldset, Form, FormAction, FormActions, FormCard, FormInput, nullable } from '@taskany/bricks';
import {
    Button,
    Badge,
    Text,
    Dropdown,
    DropdownTrigger,
    DropdownPanel,
    Input,
    ListView,
    ListViewItem,
    MenuItem,
} from '@taskany/bricks/harmony';
import { IconSearchOutline } from '@taskany/icons';

import { UpdateCandidate, CreateCandidate } from '../../modules/candidateTypes';
import { generatePath, Paths } from '../../utils/paths';
import {
    useCandidateCreateMutation,
    useCandidateUpdateMutation,
    useOutstaffVendors,
} from '../../modules/candidateHooks';
import { PhoneField } from '../PhoneField/PhoneField';
import { AddInlineTrigger } from '../AddInlineTrigger/AddInlineTrigger';

import { tr } from './AddOrUpdateCandidate.i18n';
import s from './AddOrUpdateCandidate.module.css';

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

export const AddOrUpdateCandidate: VFC<AddOrUpdateCandidateProps> = (props) => {
    const { variant, onSave, candidate } = props;

    const outstaffVendorsQuery = useOutstaffVendors();
    const outstaffVendors = outstaffVendorsQuery.data ?? [];

    const router = useRouter();

    const candidateCreateMutation = useCandidateCreateMutation();
    const candidateUpdateMutation = useCandidateUpdateMutation();

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
            outstaffVendorId: outstaffVendorId || undefined,
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
            outstaffVendorId: values.outstaffVendorId,
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
            outstaffVendorId: values.outstaffVendorId,
        };

        const result = await candidateCreateMutation.mutateAsync(data);
        const candidateId = result.id;

        if (onSave) {
            onSave(result);
        } else {
            router.push(generatePath(Paths.CANDIDATE, { candidateId })).then();
        }
    };

    const [vendorsVisible, setVendorsVisible] = useState(false);
    const [vendorSearch, setVendorSearch] = useState('');

    const onSubmit: SubmitHandler<FormValues> = variant === 'new' ? create : update;
    const onOutstaffVendorIdChange = (outstaffVendorId: string) => {
        setValue('outstaffVendorId', outstaffVendorId);
        setVendorSearch('');
        setVendorsVisible(false);
    };
    return (
        <FormCard className={s.AddOrUpdateCandidateFormCard}>
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
                    <div className={s.SelectVendor}>
                        <Text weight="bold" color={gray8} as="label">
                            {tr('Employment:')}
                        </Text>
                        <Dropdown
                            isOpen={vendorsVisible}
                            onClose={() => {
                                setVendorsVisible(false);
                            }}
                        >
                            <DropdownTrigger
                                renderTrigger={(props) => (
                                    <div ref={props.ref}>
                                        {nullable(
                                            outstaffVendors?.find(({ id }) => id === watch('outstaffVendorId'))?.title,
                                            (title) => (
                                                <Badge text={title} onClick={() => setVendorsVisible(true)} />
                                            ),
                                            <AddInlineTrigger
                                                text={tr('Choose vendor')}
                                                onClick={() => setVendorsVisible(true)}
                                                ref={props.ref}
                                            />,
                                        )}
                                    </div>
                                )}
                            />
                            <DropdownPanel placement="bottom-start" className={s.VendorsDropdown}>
                                <Input
                                    placeholder={tr('Choose vendor')}
                                    outline
                                    value={vendorSearch}
                                    autoFocus
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        setVendorSearch(e.currentTarget.value);
                                        setVendorsVisible(true);
                                    }}
                                    iconLeft={<IconSearchOutline size="s" />}
                                />
                                <ListView>
                                    {outstaffVendors
                                        .filter(({ title }) => title.toLowerCase().includes(vendorSearch.toLowerCase()))
                                        ?.map((vendor) => (
                                            <ListViewItem
                                                key={vendor.id}
                                                renderItem={({ active, hovered, ...props }) => (
                                                    <MenuItem
                                                        onClick={() => onOutstaffVendorIdChange(vendor.id)}
                                                        hovered={active || hovered}
                                                        {...props}
                                                    >
                                                        {vendor.title}
                                                    </MenuItem>
                                                )}
                                            />
                                        ))}
                                </ListView>
                            </DropdownPanel>
                        </Dropdown>
                    </div>
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
        </FormCard>
    );
};
