import { useForm, useWatch } from 'react-hook-form';
import { toDate } from 'date-fns';

import { validationRules } from '../../utils/validation-rules';
import { FormContainer } from '../FormContainer/FormContainer';
import { FormInput } from '../FormInput/FormInput';
import { DropdownFieldOption } from '../inputs/DropdownField';
import { CalendarEventInstance, EventRecurrence, EventRepeatMode } from '../../backend/modules/calendar/calendar-types';
import { Select } from '../Select';

import { defaultEventLengthInMinutes } from './calendar-event-helpers';
import { DateTimePickers } from './DateTimePickers/DateTimePickers';

import { tr } from './calendar.i18n';

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
    const submitButtonDisabled = ![startDateIsChanged, durationsIsChanged, isDirty, isSubmitting].includes(true);

    const onRepeatChange = (repeatOption: EventRepeatMode) => setValue('recurrence.repeat', repeatOption);
    const { ref: refTitle, ...restTitle } = register('title', validationRules.nonEmptyString);

    return (
        <FormContainer
            onSubmitButton={handleSubmit(onSave)}
            submitButtonText={tr('Save the event')}
            submitButtonDisabled={submitButtonDisabled}
            deleteButtonText={deleteButtonText}
            onDeleteButton={onDeleteButton}
        >
            <FormInput label={tr('Name')} helperText={errors.title?.message} {...restTitle} forwardRef={refTitle} />

            <DateTimePickers startDate={startDate} duration={duration} onChange={handleDateTimeAndDurationChange} />

            {isNew && (
                <Select
                    text={tr('Repetition')}
                    options={repeatOptions}
                    onChange={onRepeatChange}
                    value={watch('recurrence.repeat')}
                />
            )}
        </FormContainer>
    );
}
