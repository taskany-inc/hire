import { FieldValues } from 'react-hook-form';

import { PhoneField, PhoneFieldProps } from './PhoneField/PhoneField';
import { Container, Label } from './StyledComponents';

export const FormPhoneInput = <T extends FieldValues>({ label, ...restProps }: PhoneFieldProps<T>) => {
    const phoneProps = restProps as unknown as PhoneFieldProps<FieldValues>;

    return (
        <Container>
            <Label>{label}</Label>
            <PhoneField {...phoneProps} />
        </Container>
    );
};
