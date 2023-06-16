import { CSSProperties } from 'react';
import { Input } from '@taskany/bricks';

import { Container, FormHelperText, Label } from './StyledComponents';

type InputProps = JSX.LibraryManagedAttributes<typeof Input, React.ComponentProps<typeof Input>>;

export interface FormInputProps extends InputProps {
    label?: string;
    helperText?: string;
    style?: CSSProperties;
    onClick?: React.MouseEventHandler<HTMLInputElement>;
    onKeyUp?: React.KeyboardEventHandler<HTMLInputElement>;
}

export const FormInput = ({ label, helperText, style, ...restProps }: FormInputProps): JSX.Element => {
    return (
        <Container style={style}>
            <Label>{label}</Label>
            <Input {...restProps} />
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </Container>
    );
};
