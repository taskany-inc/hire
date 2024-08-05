import { useState } from 'react';
import { toDate } from 'date-fns';

import { DatePicker } from '../DatePicker';
import { TimePicker } from '../TimePicker';
import { DurationPicker } from '../DurationPicker';

import { tr } from './DateTimePickers.i18n';
import s from './DateTimePickers.module.css';

export interface DateTimeSelectorProps {
    startDate: Date;
    duration: number;
    onChange?: (data: Date, duration: number) => void;
    disabled?: boolean;
}

export function DateTimePickers({
    startDate,
    duration: initialDuration,
    onChange = () => {},
    disabled,
}: DateTimeSelectorProps): JSX.Element {
    const [date, setDate] = useState<Date>(startDate);
    const [duration, setDuration] = useState<number>(initialDuration);

    const handleStartDateChange = (newStartDate: Date) => {
        const newDate = toDate(newStartDate.setHours(date.getHours(), date.getMinutes()));

        setDate(newDate);
        onChange(newDate, duration);
    };

    const handleStartTimeChange = ({ hours, minutes }: { hours: number; minutes: number }) => {
        const newDate = toDate(date.setHours(hours, minutes));

        setDate(newDate);
        onChange(newDate, duration);
    };

    const handleDurationChange = (newDuration: number) => {
        setDuration(newDuration);
        onChange(date, newDuration);
    };

    return (
        <div className={s.DateTimePickers}>
            <DatePicker disabled={disabled} value={date} label={tr('Start date')} onChange={handleStartDateChange} />
            <TimePicker disabled={disabled} value={date} label={tr('Start time')} onChange={handleStartTimeChange} />
            <DurationPicker
                startDate={date}
                duration={duration}
                label={tr('End time')}
                onChange={handleDurationChange}
                disabled={disabled}
            />
        </div>
    );
}
