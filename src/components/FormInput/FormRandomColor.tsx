import { Control, FieldPath, FieldValues, useController } from 'react-hook-form';
import styled from 'styled-components';

import { generateColor } from '../../utils/color';

import { Container, FormHelperText } from './StyledComponents';

const StyledContainer = styled(Container)`
    display: flex;
    align-items: center;
`;

const ColorExample = styled.div<{ color: string }>`
    width: 42px;
    height: 42px;
    background-color: ${({ color }) => color};
    padding: 8px;
    background-clip: content-box;
    border-radius: 12px;
`;

type FormRandomColorProps<T extends FieldValues> = {
    label: string;
    name: FieldPath<T>;
    control: Control<T>;
};

export const FormRandomColor = <T extends FieldValues>(props: FormRandomColorProps<T>) => {
    const { name, control, label } = props;
    const { field, fieldState } = useController({ name, control });

    return (
        <StyledContainer onClick={() => field.onChange(generateColor())}>
            <ColorExample color={field.value} />
            {label}
            {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
        </StyledContainer>
    );
};
