import { useState, VFC } from 'react';
import { SectionType } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormTitle, Modal, ModalContent, ModalHeader, AddIcon } from '@taskany/bricks';

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
import { FormGradeOptions } from '../FormInput/FormGradeOptions';

import { tr } from './section-types.i18n';

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
} & ({ type: 'create'; hireStreamId: number; sectionType?: undefined } | { type: 'update'; sectionType: SectionType });

export const SectionTypeForm: VFC<SectionTypeFormProps> = ({ afterSubmit, sectionType, ...props }) => {
    const [defaultColor] = useState(() => generateColor());
    const {
        handleSubmit,
        register,
        control,
        formState: { errors, isSubmitting, isSubmitSuccessful },
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
            gradeOptions: sectionType?.gradeOptions ?? [],
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

    return (
        <FormContainer
            submitButtonText={`${props.type === 'create' ? tr('Add') : tr('Edit')} section type`}
            onSubmitButton={onSubmit}
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
                <div key={checkbox.name}>
                    <label htmlFor={checkbox.name}>
                        <input type="checkbox" {...register(checkbox.name)} id={checkbox.name} />
                        {checkbox.label}
                    </label>
                </div>
            ))}
            <FormGradeOptions name="gradeOptions" control={control} />
            <FormRandomColor label={tr('Section color in the calendar')} name="eventColor" control={control} />
        </FormContainer>
    );
};

export const NewSectionTypeModal: VFC<{ hireStreamId: number }> = ({ hireStreamId }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <AddIcon size="s" onClick={() => setOpen(true)} />

            <Modal visible={open} onClose={() => setOpen(false)}>
                <ModalHeader>
                    <FormTitle>{tr('New section type')}</FormTitle>
                </ModalHeader>
                <ModalContent>
                    <SectionTypeForm type="create" hireStreamId={hireStreamId} afterSubmit={() => setOpen(false)} />
                </ModalContent>
            </Modal>
        </>
    );
};

export const UpdateSectionTypeModal: VFC<{
    sectionType: SectionType;
    open: boolean;
    onClose: VoidFunction;
}> = ({ sectionType, open, onClose }) => {
    return (
        <Modal visible={open} onClose={onClose}>
            <ModalHeader>
                <FormTitle>{tr('Section type edit')}</FormTitle>
            </ModalHeader>
            <ModalContent>
                <SectionTypeForm type="update" sectionType={sectionType} afterSubmit={onClose} />
            </ModalContent>
        </Modal>
    );
};
