import { FC, useState, VFC } from 'react';
import { SectionType } from '@prisma/client';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormTitle, Modal, ModalContent, ModalHeader } from '@taskany/bricks';
import { IconAddOutline } from '@taskany/icons';
import styled from 'styled-components';

import {
    CreateSectionType,
    createSectionTypeSchema,
    UpdateSectionType,
    updateSectionTypeSchema,
} from '../../backend/modules/section-type/section-type-types';
import { useCreateSectionTypeMutation, useUpdateSectionTypeMutation } from '../../hooks/section-type-hooks';
import { FormContainer } from '../FormContainer/FormContainer';
import { FormInput } from '../FormInput/FormInput';
import { FormRandomColor } from '../FormInput/FormRandomColor';
import { generateColor } from '../../utils/color';
import { FormGradeDropdown } from '../FormInput/FormGradeDropdown';
import { errorsProvider } from '../../utils/forms';

import { tr } from './section-types.i18n';

const StyledCheckbox = styled.div`
    margin-bottom: 6px;
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
    const { ref: refValue, ...restValue } = register('value');
    const { ref: refTitle, ...restTitle } = register('title');

    const errorsResolver = errorsProvider(errors, isSubmitted);

    return (
        <FormContainer
            submitButtonText={tr('Save')}
            onSubmitButton={onSubmit}
            onCancelButton={onCancel}
            cancelButtonText={tr('Cancel')}
            submitButtonDisabled={isSubmitting || isSubmitSuccessful}
        >
            <FormInput
                label={tr('Section code')}
                helperText={errors.value?.message}
                placeholder={tr('For example CODING or PRODUCT_FINAL')}
                forwardRef={refValue}
                {...restValue}
            />
            <FormInput
                label={tr('Section name')}
                helperText={errors.title?.message}
                forwardRef={refTitle}
                {...restTitle}
            />
            {checkboxes.map((checkbox) => (
                <StyledCheckbox key={checkbox.name}>
                    <label htmlFor={checkbox.name}>
                        <input type="checkbox" {...register(checkbox.name)} id={checkbox.name} />
                        {checkbox.label}
                    </label>
                </StyledCheckbox>
            ))}
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
            <FormRandomColor label={tr('Section color in the calendar')} name="eventColor" control={control} />
        </FormContainer>
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
