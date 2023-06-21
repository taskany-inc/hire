import styled from 'styled-components';
import { BulbOnIcon } from '@taskany/bricks';
import { gapS, warn8 } from '@taskany/colors';

import { Tip } from '../Tip';
import { Keyboard } from '../Keyboard';

import { tr } from './candidates.i18n';

const Container = styled.div`
    display: inline-block;
`;

const StyledFormBottom = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;

    padding: ${gapS} ${gapS} 0 ${gapS};
`;

export const KeyLabel = styled.span`
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.05);
    padding: 0 2px;
`;

export interface KeyboardSubmitHintProps {
    actionTitle: string;
}

export const KeyboardSubmitHint = ({ actionTitle }: KeyboardSubmitHintProps) => {
    return (
        <Container>
            <StyledFormBottom>
                <Tip icon={<BulbOnIcon size="s" color={warn8} />}>
                    {tr.raw('Take advice! {actionTitle} by pressing', {
                        actionTitle,
                        key: <Keyboard command enter />,
                    })}
                </Tip>
            </StyledFormBottom>
        </Container>
    );
};
