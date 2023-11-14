import { useState } from 'react';
import styled from 'styled-components';
import { toDate } from 'date-fns';

import { DatePicker } from '../DatePicker';
import { TimePicker } from '../TimePicker';
import { DurationPicker } from '../DurationPicker';

import { tr } from './DateTimePickers.i18n';

export interface DateTimeSelectorProps {
    startDate: Date;
    duration: number;
    onChange?: (data: Date, duration: number) => void;
}

export const Container = styled.div`
    display: flex;
    gap: 12px;
    width: 100%;
    max-width: 500px;
    padding-top: 10px;
    padding-bottom: 10px;
`;

export function DateTimePickers({
    startDate,
    duration: initialDuration,
    onChange = () => {},
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
        <Container>
            <DatePicker value={date} label={tr('Start date')} onChange={handleStartDateChange} />
            <TimePicker value={date} label={tr('Start time')} onChange={handleStartTimeChange} />
            <DurationPicker
                startDate={date}
                duration={duration}
                label={tr('End time')}
                onChange={handleDurationChange}
            />
        </Container>
    );
}
