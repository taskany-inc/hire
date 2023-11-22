import { Control, FieldPath, FieldValues, useController } from 'react-hook-form';
import styled from 'styled-components';
import { ErrorPopup, Text } from '@taskany/bricks';
import { gapM, gapS, gray8 } from '@taskany/colors';

import { generateColor } from '../utils/color';

const StyledContainer = styled.div`
    width: 100%;
    max-width: 500px;
    padding: ${gapS} ${gapM};
    display: flex;
    align-items: center;
`;

const ColorExample = styled.div<{ color: string }>`
    width: 42px;
    height: 42px;
    background-color: ${({ color }) => color};
    padding: ${gapS};
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
            <Text as="label" size="m" color={gray8} weight="bold">
                {label}
            </Text>
            <ColorExample color={field.value} />
            {fieldState.error && <ErrorPopup>{fieldState.error.message}</ErrorPopup>}
        </StyledContainer>
    );
};
