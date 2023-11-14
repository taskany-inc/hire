import { useState } from 'react';
import { format, parse } from 'date-fns';
import { Input } from '@taskany/bricks';

import { Container, Label } from './StyledComponents';

type DatePickerProps = {
    value: Date;
    onChange?: (value: Date) => void;
    label?: string;
};

const DATE_FORMAT = 'yyyy-MM-dd';

export const DatePicker = ({ label, value, onChange = () => {} }: DatePickerProps): JSX.Element => {
    const [date, setDate] = useState<string>(() => format(value, DATE_FORMAT));
    const handleChange = ({ target: { value: eventValue } }: React.ChangeEvent<{ value: string }>): void => {
        const formattedDate: Date = parse(eventValue, DATE_FORMAT, new Date(value));

        setDate(eventValue);
        onChange(formattedDate);
    };

    return (
        <Container>
            <Label>{label}</Label>
            <Input type="date" defaultValue={date} onChange={handleChange} />
        </Container>
    );
};
