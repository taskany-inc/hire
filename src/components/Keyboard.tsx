import React from 'react';
import styled from 'styled-components';
import { gray4, gray8, gray9, radiusM } from '@taskany/colors';
import { Text } from '@taskany/bricks';

interface KeyboardProps {
    command?: boolean;
    shift?: boolean;
    option?: boolean;
    ctrl?: boolean;
    enter?: boolean;
    space?: boolean;
    children?: React.ReactNode;
}

const StyledKeyboard = styled.kbd`
    display: inline-block;
    padding: 2px 5px;

    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
    line-height: 1.1em;
    text-align: center;
    color: ${gray9};

    cursor: pointer;

    background-color: ${gray4};

    border-radius: ${radiusM};

    border: 1px solid ${gray8};

    box-shadow: inset 0 -1px 0 ${gray8};

    transition: 200ms cubic-bezier(0.3, 0, 0.5, 1);
    transition-property: box-shadow;

    &:hover {
        box-shadow: inset 0 0px 0 ${gray8};
    }
`;

const StyledSpan = styled(Text)`
    font-size: inherit;
    text-align: center;
    display: inline-block;
    vertical-align: middle;
`;

export const Keyboard: React.FC<KeyboardProps> = ({ command, shift, option, ctrl, enter, space, children }) => {
    return (
        <StyledKeyboard>
            <StyledSpan>
                {command && (
                    <Text size="xs" as="span" color="gray">
                        ⌘
                    </Text>
                )}
                {shift && (
                    <Text size="xs" as="span">
                        ⇧
                    </Text>
                )}
                {option && (
                    <Text size="xs" as="span" color="gray">
                        ⌥
                    </Text>
                )}
                {ctrl && (
                    <Text size="xs" as="span" color="gray">
                        ⌃
                    </Text>
                )}
                {enter && (
                    <Text size="xs" as="span" color="gray" style={{ marginLeft: '0.2em' }}>
                        ⏎
                    </Text>
                )}
                {space && (
                    <Text size="xs" as="span" color="gray">
                        Space
                    </Text>
                )}
                {children && (
                    <Text size="xs" as="span" color="gray">
                        {children}
                    </Text>
                )}
            </StyledSpan>
        </StyledKeyboard>
    );
};
