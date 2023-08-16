/* stylelint-disable order/order */
import React from 'react';
import styled from 'styled-components';
import { gapS, gapXs, gray3, radiusM } from '@taskany/colors';
import { Text, StateDot } from '@taskany/bricks';

const StyledItemCard = styled.div<{ focused?: boolean; checked?: boolean; hoverColor?: string }>`
    display: flex;
    align-items: center;

    box-sizing: border-box;
    padding: ${gapXs} ${gapS};
    margin-bottom: ${gapS};
    min-width: 150px;

    border-radius: ${radiusM};

    cursor: pointer;

    &:last-child {
        margin-bottom: 0;
    }

    &:hover {
        background-color: ${gray3};
    }

    ${({ focused }) =>
        focused &&
        `
            background-color: ${gray3};
        `}

    ${({ checked, hoverColor }) =>
        checked &&
        hoverColor &&
        `
            background-color: ${hoverColor};
        `}

    ${({ hoverColor }) =>
        hoverColor &&
        `
            &:hover {
                background-color: ${hoverColor};
            }
        `}

    ${({ hoverColor, focused }) =>
        hoverColor &&
        focused &&
        `
            background-color: ${hoverColor};
        `}
`;

const NoWrap = styled.div`
    white-space: nowrap;
`;

const StyledItemInfo = styled(Text)`
    padding-left: ${gapS};
`;

export const ColorizedMenuItem: React.FC<{
    title?: string;
    hoverColor?: string;
    focused?: boolean;
    checked?: boolean;
    onClick?: () => void;
}> = ({ hoverColor, title, focused, checked, onClick }) => {
    return (
        <StyledItemCard hoverColor={hoverColor} focused={focused} checked={checked} onClick={onClick}>
            <NoWrap>
                <StateDot size={'s'} />
            </NoWrap>
            <StyledItemInfo size="s" weight="bold">
                {title}
            </StyledItemInfo>
        </StyledItemCard>
    );
};
