import { useMemo, useState } from 'react';

import { getOptions, getStringTime, splitDateValue, SplitDateValueResult } from '../utils/dateTimePickers';

import { Select } from './Select';

interface TimePickerProps {
    value: Date;
    onChange?: (value: SplitDateValueResult) => void;
    label?: string;
    disabled?: boolean;
}
export const TimePicker = ({
    value: initialValue,
    disabled,
    label,
    onChange = () => {},
}: TimePickerProps): JSX.Element => {
    const options = useMemo(() => getOptions(), []);
    const [value, setValue] = useState<string>(getStringTime(initialValue.getHours(), initialValue.getMinutes()));
    const handleChange = (eventValue: string): void => {
        setValue(eventValue as string);
        onChange(splitDateValue(eventValue as string));
    };

    return <Select disabled={disabled} text="" value={value} onChange={handleChange} options={options} label={label} />;
};
