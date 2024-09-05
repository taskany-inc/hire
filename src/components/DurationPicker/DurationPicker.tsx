import { useMemo, useState } from 'react';
import { Badge, FormControl, FormControlLabel } from '@taskany/bricks/harmony';

import { getOptionsWithDuration } from '../../utils/dateTimePickers';
import { Select } from '../Select';

import s from './DurationPicker.module.css';

interface DurationPickerProps {
    startDate: Date;
    duration: number;
    label?: string;
    onChange?: (x: number) => void;
    disabled?: boolean;
}

export const DurationPicker = ({
    startDate,
    duration: initialDuration,
    label,
    onChange,
    disabled,
}: DurationPickerProps): JSX.Element => {
    const options = useMemo(() => getOptionsWithDuration(startDate), [startDate]);
    const [duration, setDuration] = useState(initialDuration);

    const handleChange = (eventDuration: number): void => {
        setDuration(eventDuration);

        if (onChange) {
            onChange(eventDuration);
        }
    };

    return (
        <FormControl className={s.DurationPicker}>
            <FormControlLabel className={s.DurationPickerLabel}>{label}</FormControlLabel>
            <Select
                items={options.map((item) => ({ ...item, id: String(item.id) }))}
                onChange={(id) => handleChange(Number(id))}
                renderTrigger={({ ref, onClick }) => (
                    <Badge
                        size="m"
                        onClick={() => !disabled && onClick()}
                        ref={ref}
                        text={options.find(({ id }) => id === duration)?.text}
                    />
                )}
                selectPanelClassName={s.DurationPickerSelectPanelWrapper}
            />
        </FormControl>
    );
};
