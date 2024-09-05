import { useState } from 'react';
import { format, parse } from 'date-fns';
import { FormControl, FormControlLabel, FormControlInput } from '@taskany/bricks/harmony';

import s from './DatePicker.module.css';

interface DatePickerProps {
    value?: Date;
    onChange?: (value: Date) => void;
    label?: string;
    disabled?: boolean;
}

const DATE_FORMAT = 'yyyy-MM-dd';

export const DatePicker = ({ label, disabled, value, onChange = () => {} }: DatePickerProps): JSX.Element => {
    const initialDate = () => (value ? format(value, DATE_FORMAT) : undefined);
    const [date, setDate] = useState<string | undefined>(initialDate);
    const handleChange = ({ target: { value: eventValue } }: React.ChangeEvent<{ value: string }>): void => {
        const formattedDate: Date = parse(eventValue, DATE_FORMAT, value ? new Date(value) : new Date());

        setDate(eventValue);
        onChange(formattedDate);
    };

    return (
        <FormControl className={s.DatePicker}>
            <FormControlLabel className={s.DatePickerLabel}>{label}</FormControlLabel>
            <FormControlInput disabled={disabled} type="date" defaultValue={date} onChange={handleChange} />
        </FormControl>
    );
};
