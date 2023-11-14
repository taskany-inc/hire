/* eslint-disable no-underscore-dangle */
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { colorPrimary, textColorPrimary } from '@taskany/colors';
import { Button } from '@taskany/bricks';

import { reactionEmoji, ReactionEnum } from '../utils/dictionaries';
import { ReactionType } from '../modules/reactionTypes';

type ReactionLabelProps = {
    reaction: ReactionType;
    onClick?: (arg: ReactionType) => void;
    disabled?: boolean;
};
const StyledRoot = styled(Button)<{ isSelect: boolean }>`
    font-weight: 600;
    border-radius: 16px;
    height: 24px;
    min-width: unset;
    border: 1px solid;
    border-color: ${({ isSelect }) => (isSelect ? colorPrimary : '#676767')};
    background-color: ${({ isSelect }) => (isSelect ? colorPrimary : 'transparent')};
    color: ${textColorPrimary};

    &:hover {
        background-color: ${colorPrimary};
    }
`;

export const Reaction = ({ reaction, onClick, disabled }: ReactionLabelProps): JSX.Element => {
    const [currentReaction, setCurrentReaction] = useState<ReactionType>(reaction);

    useEffect(() => {
        setCurrentReaction(reaction);
    }, [reaction]);

    const handleClick = () => {
        const { isSelect, count } = currentReaction;
        const newCurrentReaction = {
            ...currentReaction,
            count: isSelect ? count - 1 : count + 1,
            isSelect: !isSelect,
        };

        setCurrentReaction(newCurrentReaction);

        if (onClick) {
            onClick(newCurrentReaction);
        }
    };

    const text = `${reactionEmoji[reaction.name as ReactionEnum]} ${
        currentReaction.count > 0 ? currentReaction.count : ''
    }`;

    return (
        <StyledRoot
            type="button"
            isSelect={currentReaction.isSelect}
            onClick={handleClick}
            disabled={disabled}
            text={text}
        />
    );
};
