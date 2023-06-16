import { useMemo, useState } from 'react';

import { Select } from '../../Select';

import { getOptionsWithDuration } from './utils';

type DurationPickerProps = {
    startDate: Date;
    duration: number;
    label?: string;
    onChange?: (x: number) => void;
};

export const DurationPicker = ({
    startDate,
    duration: initialDuration,
    label,
    onChange,
}: DurationPickerProps): JSX.Element => {
    const options = useMemo(() => getOptionsWithDuration(startDate), [startDate]);
    const [duration, setDuration] = useState(initialDuration);

    const handleChange = (eventDuration: number): void => {
        setDuration(eventDuration);

        if (onChange) {
            onChange(eventDuration);
        }
    };

    return <Select text="" value={duration} onChange={handleChange} options={options} label={label} />;
};
