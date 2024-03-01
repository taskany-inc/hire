import { useForm, useWatch } from 'react-hook-form';
import { toDate } from 'date-fns';
import { Button, Fieldset, Form, FormAction, FormActions, FormCard, FormInput } from '@taskany/bricks';

import { DropdownFieldOption } from '../DropdownField';
import { CalendarEventInstance, EventRecurrence, EventRepeatMode } from '../../modules/calendarTypes';
import { Select } from '../Select';
import { DateTimePickers } from '../DateTimePickers/DateTimePickers';
import { defaultEventLengthInMinutes } from '../../utils/calendar';

import { tr } from './CalendarEventForm.i18n';

export type CalendarEventFormValues = Pick<CalendarEventInstance, 'title' | 'date' | 'description' | 'duration'> & {
    recurrence: {
        repeat: EventRepeatMode;
    };
};

export type CalendarEventFormInitialValues = Partial<CalendarEventFormValues> & {
    recurrence?: EventRecurrence;
    date: Date;
};

interface CalendarEventFormProps {
    initialValues?: CalendarEventFormInitialValues;
    onSave: (values: CalendarEventFormValues) => Promise<void>;
    isNew: boolean;
    onDeleteButton?: () => void;
    deleteButtonText?: string;
    deleteButtonDisabled?: boolean;
}

const repeatOptions: DropdownFieldOption<EventRepeatMode>[] = [
    { text: tr('Never'), value: 'never' },
    { text: tr('Daily'), value: 'daily' },
    { text: tr('Weekly'), value: 'weekly' },
    { text: tr('Monthly'), value: 'monthly' },
];

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function CalendarEventForm({
    initialValues,
    onSave,
    isNew,
    onDeleteButton,
    deleteButtonText,
    deleteButtonDisabled,
}: CalendarEventFormProps) {
    const {
        handleSubmit,
        register,
        control,
        setValue,
        watch,
        formState: { isDirty, isSubmitting, errors },
    } = useForm<CalendarEventFormValues>({
        defaultValues: {
            title: initialValues?.title ?? '',
            date: toDate(initialValues?.date ?? 0),
            description: initialValues?.description ?? '',
            duration: initialValues?.duration ?? defaultEventLengthInMinutes,
            recurrence: {
                repeat: initialValues?.recurrence?.repeat ?? 'never',
            },
        },
    });

    const startDate = useWatch({ control, name: 'date' });
    const duration = useWatch({ control, name: 'duration' });

    const handleDateTimeAndDurationChange = (newDate: Date, newDuration: number) => {
        setValue('date', newDate);
        setValue('duration', newDuration);
    };

    const startDateIsChanged = JSON.stringify(startDate) !== JSON.stringify(initialValues?.date);
    const durationsIsChanged = JSON.stringify(duration) !== JSON.stringify(initialValues?.duration);
    const submitButtonDisabled = ![startDateIsChanged, durationsIsChanged, isDirty].includes(true) || isSubmitting;

    const onRepeatChange = (repeatOption: EventRepeatMode) => setValue('recurrence.repeat', repeatOption);

    return (
        <FormCard>
            <Form onSubmit={handleSubmit(onSave)}>
                <Fieldset>
                    <FormInput
                        {...register('title')}
                        label={tr('Name')}
                        autoComplete="off"
                        flat="bottom"
                        error={errors.title}
                    />

                    <DateTimePickers
                        startDate={startDate}
                        duration={duration}
                        onChange={handleDateTimeAndDurationChange}
                    />

                    {isNew && (
                        <Select
                            text={tr('Repetition')}
                            options={repeatOptions}
                            onChange={onRepeatChange}
                            value={watch('recurrence.repeat')}
                        />
                    )}
                </Fieldset>
                <FormActions flat="top">
                    <FormAction left inline></FormAction>
                    <FormAction right inline>
                        {deleteButtonText && (
                            <Button
                                type="button"
                                onClick={onDeleteButton}
                                text={deleteButtonText}
                                view="danger"
                                size="m"
                                outline
                                disabled={deleteButtonDisabled}
                            />
                        )}
                        <Button
                            disabled={submitButtonDisabled}
                            size="m"
                            view="primary"
                            type="submit"
                            text={tr('Save the event')}
                            outline
                        />
                    </FormAction>
                </FormActions>
            </Form>
        </FormCard>
    );
}
