import { FC, ReactNode } from 'react';
import styled from 'styled-components';
import { gray1 } from '@taskany/colors';

import { PropsWithClassName } from '../utils/types';

const StyledCardRoot = styled.div`
    padding: 20px 40px 20px 5px;
    display: grid;
    grid-template-columns: auto 1fr;
    border-radius: 6px;
    gap: 4px;

    &:hover {
        background-color: ${gray1};
    }
`;

type CardProps = PropsWithClassName<{
    action?: ReactNode;
    children?: ReactNode;
}>;

export const Card: FC<CardProps> = ({ action, className, children }) => {
    return (
        <StyledCardRoot className={className}>
            <div style={{ marginTop: 8 }}>{action}</div>
            <div>{children}</div>
        </StyledCardRoot>
    );
};
