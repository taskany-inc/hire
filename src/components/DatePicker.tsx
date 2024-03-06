import { useState } from 'react';
import { format, parse } from 'date-fns';
import { Input, Text } from '@taskany/bricks';
import { gray8 } from '@taskany/colors';

import { Stack } from './Stack';

interface DatePickerProps {
    value: Date;
    onChange?: (value: Date) => void;
    label?: string;
}

const DATE_FORMAT = 'yyyy-MM-dd';

export const DatePicker = ({ label, value, onChange = () => {} }: DatePickerProps): JSX.Element => {
    const [date, setDate] = useState<string>(() => format(value, DATE_FORMAT));
    const handleChange = ({ target: { value: eventValue } }: React.ChangeEvent<{ value: string }>): void => {
        const formattedDate: Date = parse(eventValue, DATE_FORMAT, new Date(value));

        setDate(eventValue);
        onChange(formattedDate);
    };

    return (
        <Stack direction="column">
            <Text as="label" size="m" color={gray8} weight="bold">
                {label}
            </Text>
            <Input type="date" defaultValue={date} onChange={handleChange} />
        </Stack>
    );
};
