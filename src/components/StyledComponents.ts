import styled, { css } from 'styled-components';
import { danger0, gray9 } from '@taskany/colors';
import { Text } from '@taskany/bricks';

export const Container = styled.div`
    width: 100%;
    max-width: 500px;
    padding-top: 10px;
    padding-bottom: 10px;
`;

export const Label = styled.div`
    font-style: normal;
    font-weight: normal;
    font-size: 16px;
    line-height: 20px;
    margin-bottom: 5px;

    color: ${gray9};
`;

export const formHelperTextStyles = css`
    color: ${danger0};
`;

export const FormHelperText = styled(Text)`
    ${formHelperTextStyles}
`;
