import styled from 'styled-components';
import { IconBulbOnOutline } from '@taskany/icons';
import { warn8 } from '@taskany/colors';

import { Tip } from '../Tip';
import { Keyboard } from '../Keyboard';

import { tr } from './candidates.i18n';

const Container = styled.div`
    display: flex;
`;

const StyledFormBottom = styled.div`
    display: flex;
    align-items: flex-end;
`;

export const KeyLabel = styled.span`
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.05);
`;

export interface KeyboardSubmitHintProps {
    actionTitle: string;
}

export const KeyboardSubmitHint = ({ actionTitle }: KeyboardSubmitHintProps) => {
    return (
        <Container>
            <StyledFormBottom>
                <Tip icon={<IconBulbOnOutline size="s" color={warn8} />}>
                    {tr.raw('Take advice! {actionTitle} by pressing {key}', {
                        actionTitle,
                        key: <Keyboard command enter />,
                    })}
                </Tip>
            </StyledFormBottom>
        </Container>
    );
};
