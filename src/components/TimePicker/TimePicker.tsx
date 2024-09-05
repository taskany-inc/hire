import { Badge, FormControl, FormControlLabel } from '@taskany/bricks/harmony';
import { useMemo, useState } from 'react';

import { getOptions, getStringTime, splitDateValue, SplitDateValueResult } from '../../utils/dateTimePickers';
import { Select } from '../Select';

import s from './TimePicker.module.css';

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

    return (
        <FormControl className={s.TimePicker}>
            <FormControlLabel className={s.TimePickerLabel}>{label}</FormControlLabel>
            <Select
                items={options.map((item) => ({ ...item, id: String(item.id) }))}
                onChange={(id) => id && handleChange(id)}
                renderTrigger={({ ref, onClick }) => (
                    <Badge
                        size="m"
                        onClick={() => !disabled && onClick()}
                        ref={ref}
                        text={options.find(({ id }) => id === value)?.text}
                    />
                )}
                selectPanelClassName={s.TimePickerSelectPanelWrapper}
                placement="bottom-start"
            />
        </FormControl>
    );
};
