import { Badge, Text } from '@taskany/bricks/harmony';
import { useMemo, useState } from 'react';
import { gray8 } from '@taskany/colors';

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
        <div>
            <Text weight="bold" color={gray8} className={s.Label}>
                {label}
            </Text>
            <Select
                items={options.map((item) => ({ ...item, id: String(item.id) }))}
                onChange={(id) => id && handleChange(id)}
                renderTrigger={({ ref, onClick }) => (
                    <Badge
                        color={gray8}
                        size="m"
                        onClick={() => !disabled && onClick()}
                        ref={ref}
                        text={options.find(({ id }) => id === value)?.text}
                    />
                )}
                selectPanelClassName={s.SelectPanelWrapper}
                placement="bottom-start"
            />
        </div>
    );
};
