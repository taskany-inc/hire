import { FC, useState, VFC } from 'react';
import { SectionType } from '@prisma/client';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Button,
    Fieldset,
    Form,
    FormAction,
    FormActions,
    FormCard,
    FormInput,
    FormTitle,
    Modal,
    ModalContent,
    ModalHeader,
    Text,
} from '@taskany/bricks';
import { gapM, gapS, gray8 } from '@taskany/colors';
import { IconAddOutline } from '@taskany/icons';
import styled from 'styled-components';

import {
    CreateSectionType,
    createSectionTypeSchema,
    UpdateSectionType,
    updateSectionTypeSchema,
} from '../../modules/sectionTypeTypes';
import { useCreateSectionTypeMutation, useUpdateSectionTypeMutation } from '../../modules/sectionTypeHooks';
import { generateColor } from '../../utils/color';
import { errorsProvider } from '../../utils/forms';
import { FormRandomColor } from '../FormRandomColor';
import { FormGradeDropdown } from '../FormGradeDropdown/FormGradeDropdown';

import { tr } from './SectionTypeForm.i18n';

const StyledCheckbox = styled.div`
    margin-bottom: ${gapS};
    margin-left: ${gapM};
`;

const StyledGradesDropdownWrapper = styled.div`
    margin-left: ${gapM};
`;

const checkboxes: {
    label: string;
    name: 'hasTasks' | 'userSelect' | 'showOtherGrades' | 'schedulable';
}[] = [
    { label: tr('You can add tasks to the section'), name: 'hasTasks' },
    { label: tr('The team is selected in the section'), name: 'userSelect' },
    {
        label: tr('The section shows the results of other sections'),
        name: 'showOtherGrades',
    },
    { label: tr('Section can be assigned via calendar'), name: 'schedulable' },
];

type SectionTypeFormProps = {
    afterSubmit: VoidFunction;
    onCancel: VoidFunction;
} & ({ type: 'create'; hireStreamId: number; sectionType?: undefined } | { type: 'update'; sectionType: SectionType });

export const SectionTypeForm: VFC<SectionTypeFormProps> = ({ afterSubmit, onCancel, sectionType, ...props }) => {
    const [defaultColor] = useState(() => generateColor());
    const {
        handleSubmit,
        register,
        control,
        formState: { isSubmitted, errors, isSubmitting, isSubmitSuccessful },
    } = useForm<CreateSectionType & UpdateSectionType>({
        defaultValues: {
            hireStreamId: props.type === 'create' ? props.hireStreamId : undefined,
            sectionTypeId: sectionType?.id,
            value: sectionType?.value ?? '',
            title: sectionType?.title ?? '',
            hasTasks: sectionType?.hasTasks ?? true,
            userSelect: sectionType?.userSelect ?? false,
            showOtherGrades: sectionType?.showOtherGrades ?? false,
            schedulable: sectionType?.schedulable ?? false,
            eventColor: sectionType?.eventColor ?? defaultColor,
            gradeOptions: sectionType?.gradeOptions,
        },
        resolver: zodResolver(props.type === 'create' ? createSectionTypeSchema : updateSectionTypeSchema),
    });
    const createSectionType = useCreateSectionTypeMutation();
    const updateSectionType = useUpdateSectionTypeMutation();

    const onSubmit = handleSubmit((values) =>
        (props.type === 'create' ? createSectionType : updateSectionType).mutateAsync(values).then(afterSubmit),
    );

    const errorsResolver = errorsProvider(errors, isSubmitted);

    return (
        <FormCard>
            <Form onSubmit={onSubmit}>
                <Fieldset>
                    <FormInput
                        label={tr('Section code')}
                        error={errors.value}
                        placeholder={tr('For example CODING or PRODUCT_FINAL')}
                        {...register('value')}
                        autoComplete="off"
                        flat="bottom"
                    />
                    <FormInput label={tr('Section name')} error={errors.title} {...register('title')} />

                    <FormRandomColor label={tr('Section color in the calendar')} name="eventColor" control={control} />
                    {checkboxes.map((checkbox) => (
                        <StyledCheckbox key={checkbox.name}>
                            <Text as="label" htmlFor={checkbox.name} color={gray8}>
                                <input type="checkbox" {...register(checkbox.name)} id={checkbox.name} />
                                {checkbox.label}
                            </Text>
                        </StyledCheckbox>
                    ))}
                    <StyledGradesDropdownWrapper>
                        <Controller
                            name="gradeOptions"
                            control={control}
                            render={({ field }) => (
                                <FormGradeDropdown
                                    text={tr('Grade options')}
                                    disabled={isSubmitting}
                                    error={errorsResolver(field.name)}
                                    {...field}
                                />
                            )}
                        />
                    </StyledGradesDropdownWrapper>
                </Fieldset>
                <FormActions flat="top">
                    <FormAction left inline></FormAction>
                    <FormAction right inline>
                        <Button onClick={onCancel} text={tr('Cancel')} size="m" outline type="button" />
                        <Button
                            size="m"
                            view="primary"
                            type="submit"
                            disabled={isSubmitting || isSubmitSuccessful}
                            text={tr('Save')}
                            outline
                        />
                    </FormAction>
                </FormActions>
            </Form>
        </FormCard>
    );
};

export const NewSectionTypeModal: VFC<{ hireStreamId: number }> = ({ hireStreamId }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <IconAddOutline size="s" onClick={() => setOpen(true)} />

            <Modal visible={open} onClose={() => setOpen(false)} width={600}>
                <ModalHeader>
                    <FormTitle>{tr('New section type')}</FormTitle>
                </ModalHeader>
                <ModalContent>
                    <SectionTypeForm
                        type="create"
                        hireStreamId={hireStreamId}
                        afterSubmit={() => setOpen(false)}
                        onCancel={() => setOpen(false)}
                    />
                </ModalContent>
            </Modal>
        </>
    );
};

export const UpdateSectionTypeModal: FC<{
    sectionType: SectionType;
    open: boolean;
    onClose: VoidFunction;
}> = ({ sectionType, open, onClose }) => {
    return (
        <Modal visible={open} onClose={onClose} width={600}>
            <ModalHeader>
                <FormTitle>{tr('Section type edit')}</FormTitle>
            </ModalHeader>
            <ModalContent>
                <SectionTypeForm type="update" sectionType={sectionType} afterSubmit={onClose} onCancel={onClose} />
            </ModalContent>
        </Modal>
    );
};
