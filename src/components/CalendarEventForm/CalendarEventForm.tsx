import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toDate } from 'date-fns';
import { nullable } from '@taskany/bricks';
import {
    Button,
    Text,
    FormControl,
    FormControlInput,
    FormControlLabel,
    FormControlError,
} from '@taskany/bricks/harmony';

import { useSession } from '../../contexts/appSettingsContext';
import { CalendarEventInstance, EventRecurrence, EventRepeatMode } from '../../modules/calendarTypes';
import { Select } from '../Select';
import { DateTimePickers } from '../DateTimePickers/DateTimePickers';
import { defaultEventLengthInMinutes } from '../../utils/calendar';

import { tr } from './CalendarEventForm.i18n';
import s from './CalendarEventForm.module.css';

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
    creatorId?: number;
}

export function CalendarEventForm({
    initialValues,
    onSave,
    isNew,
    onDeleteButton,
    deleteButtonText,
    deleteButtonDisabled,
    creatorId,
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

    const repeatOptions = useMemo<{ id: EventRepeatMode; text: string }[]>(
        () => [
            { text: tr('Never'), id: 'never' },
            { text: tr('Daily'), id: 'daily' },
            { text: tr('Weekly'), id: 'weekly' },
            { text: tr('Monthly'), id: 'monthly' },
        ],
        [],
    );

    const startDate = useWatch({ control, name: 'date' });
    const duration = useWatch({ control, name: 'duration' });

    const session = useSession();
    if (!session) {
        return;
    }

    const handleDateTimeAndDurationChange = (newDate: Date, newDuration: number) => {
        setValue('date', newDate);
        setValue('duration', newDuration);
    };

    const startDateIsChanged = JSON.stringify(startDate) !== JSON.stringify(initialValues?.date);
    const durationsIsChanged = JSON.stringify(duration) !== JSON.stringify(initialValues?.duration);
    const submitButtonDisabled = ![startDateIsChanged, durationsIsChanged, isDirty].includes(true) || isSubmitting;

    const onRepeatChange = (repeatOption: EventRepeatMode) => setValue('recurrence.repeat', repeatOption);
    const canEdit = isNew || creatorId === session.user.id || session.user.admin;

    return (
        <form onSubmit={handleSubmit(onSave)} className={s.CalendarEventForm}>
            <FormControl className={s.CalendarEventFormInput}>
                <FormControlLabel>{tr('Name')}</FormControlLabel>
                <FormControlInput {...register('title')} autoComplete="off" disabled={!canEdit} />
                {nullable(errors.title, (e) => (
                    <FormControlError error={e} />
                ))}
            </FormControl>

            <DateTimePickers
                startDate={startDate}
                duration={duration}
                onChange={handleDateTimeAndDurationChange}
                disabled={!canEdit}
            />

            {nullable(isNew, () => (
                <Text weight="bold" className={s.CalendarEventFormRepetition}>
                    {tr('Repetition')}
                    <Select
                        items={repeatOptions}
                        onChange={(id) => onRepeatChange(id as EventRepeatMode)}
                        renderTrigger={({ ref, onClick }) => (
                            <Button
                                onClick={onClick}
                                size="s"
                                ref={ref}
                                text={repeatOptions.find(({ id }) => id === watch('recurrence.repeat'))?.text}
                            />
                        )}
                    />
                </Text>
            ))}

            {nullable(canEdit, () => (
                <div className={s.CalendarEventFormActions}>
                    {deleteButtonText && (
                        <Button
                            type="button"
                            onClick={onDeleteButton}
                            text={deleteButtonText}
                            view="danger"
                            size="m"
                            disabled={deleteButtonDisabled}
                        />
                    )}
                    <Button
                        disabled={submitButtonDisabled}
                        size="m"
                        view="primary"
                        type="submit"
                        text={tr('Save the event')}
                    />
                </div>
            ))}
        </form>
    );
}
