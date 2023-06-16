/* stylelint-disable selector-nested-pattern */
import React, { TextareaHTMLAttributes } from 'react';
import styled from 'styled-components';
import { gray10, gray3, gray4, gray6, gray7, radiusM, textColor } from '@taskany/colors';

import { Container, FormHelperText, Label } from './StyledComponents';

export interface FormTextAreaProps extends TextareaHTMLAttributes<any> {
    label?: string;
    helperText?: string;
}

const StyledTextArea = styled.textarea`
    box-sizing: border-box;
    width: 100%;

    font-weight: 500;
    min-width: 90%;

    outline: none;
    border: 1px solid;
    border-radius: ${radiusM};

    transition: 200ms cubic-bezier(0.3, 0, 0.5, 1);
    transition-property: color, background-color, border-color;

    color: ${gray10};
    border-color: ${gray6};
    background-color: ${gray4};

    :hover:not([disabled]),
    :focus:not([disabled]) {
        color: ${textColor};
        border-color: ${gray7};
        background-color: ${gray3};
    }
`;

export const FormTextArea = React.forwardRef<HTMLTextAreaElement, FormTextAreaProps>(
    ({ label, helperText, ...restProps }, ref) => {
        return (
            <Container>
                <Label>{label}</Label>
                <StyledTextArea ref={ref} {...restProps} />
                {helperText && <FormHelperText>{helperText}</FormHelperText>}
            </Container>
        );
    },
);
