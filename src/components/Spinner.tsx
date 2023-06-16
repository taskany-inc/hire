import { FC } from 'react';
import styled, { keyframes } from 'styled-components';
import { textColor } from '@taskany/colors';

const rotate = keyframes`
    100% {
        transform: rotate(360deg);
    }
`;

const dash = keyframes`
    0% {
        stroke-dasharray: 1, 150;
        stroke-dashoffset: 0;
    }

    50% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -35;
    }

    100% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -124;
    }
`;

const SyledSpinner = styled.svg`
    animation: ${rotate} 2s linear infinite;
    z-index: 2;
    position: absolute;
    top: 50%;
    left: 50%;
    margin: -25px 0 0 -25px;
    width: 50px;
    height: 50px;

    & .path {
        stroke: hsl(210, 70, 75);
        stroke-linecap: round;
        animation: ${dash} 1.5s ease-in-out infinite;
    }
`;

export const Spinner: FC = () => {
    return (
        <SyledSpinner viewBox="0 0 50 50" color={textColor}>
            <circle className="path" cx="25" cy="25" r="20" fill="none" stroke={textColor} strokeWidth="5" />
        </SyledSpinner>
    );
};
