import { useMemo, useState } from 'react';
import { Badge, Text } from '@taskany/bricks/harmony';
import { gray8 } from '@taskany/colors';

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
        <div>
            <Text weight="bold" color={gray8} className={s.Label}>
                {label}
            </Text>
            <Select
                items={options.map((item) => ({ ...item, id: String(item.id) }))}
                onChange={(id) => handleChange(Number(id))}
                renderTrigger={({ ref, onClick }) => (
                    <Badge
                        color={gray8}
                        size="m"
                        onClick={() => !disabled && onClick()}
                        ref={ref}
                        text={options.find(({ id }) => id === duration)?.text}
                    />
                )}
                selectPanelClassName={s.SelectPanelWrapper}
            />
        </div>
    );
};
