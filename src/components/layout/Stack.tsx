import { CSSProperties, FC, ReactNode } from 'react';
import styled from 'styled-components';

type StackProps = {
    direction: 'row' | 'column';
    gap?: number | string;
    align?: CSSProperties['alignItems'];
    justifyItems?: CSSProperties['justifyItems'];
    justifyContent?: CSSProperties['justifyContent'];
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
};

const StyledStack = styled.div<StackProps>`
    display: grid;
    grid-auto-flow: ${({ direction }) => (direction === 'row' ? 'column' : 'row')};
    align-items: ${({ align }) => align};
    justify-items: ${({ justifyItems }) => justifyItems};
    justify-content: ${({ justifyContent }) => justifyContent};
    gap: ${({ gap }) => (typeof gap === 'number' ? `${gap}px` : gap)};
`;

export const Stack: FC<StackProps> = (props) => (
    <StyledStack
        direction={props.direction}
        align={props.align}
        justifyContent={props.justifyContent}
        justifyItems={props.justifyItems}
        gap={props.gap}
        className={props.className}
        style={props.style}
    >
        {props.children}
    </StyledStack>
);
