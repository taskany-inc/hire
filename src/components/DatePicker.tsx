import { useState } from 'react';
import { format, parse } from 'date-fns';
import { Input, Text } from '@taskany/bricks';
import { gray8 } from '@taskany/colors';

import { Stack } from './Stack';

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
        <Stack direction="column">
            <Text as="label" size="m" color={gray8} weight="bold">
                {label}
            </Text>
            <Input disabled={disabled} type="date" defaultValue={date} onChange={handleChange} />
        </Stack>
    );
};
