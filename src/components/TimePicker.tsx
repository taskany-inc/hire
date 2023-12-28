import { useMemo, useState } from 'react';

import { getOptions, getStringTime, splitDateValue, SplitDateValueResult } from '../utils/dateTimePickers';

import { Select } from './Select';

type TimePickerProps = {
    value: Date;
    onChange?: (value: SplitDateValueResult) => void;
    label?: string;
};

export const TimePicker = ({ value: initialValue, label, onChange = () => {} }: TimePickerProps): JSX.Element => {
    const options = useMemo(() => getOptions(), []);
    const [value, setValue] = useState<string>(getStringTime(initialValue.getHours(), initialValue.getMinutes()));
    const handleChange = (eventValue: string): void => {
        setValue(eventValue as string);
        onChange(splitDateValue(eventValue as string));
    };

    return <Select text="" value={value} onChange={handleChange} options={options} label={label} />;
};
