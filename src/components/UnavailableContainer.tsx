import { FC, ReactNode } from 'react';
import styled from 'styled-components';

interface isUnavailableContaineProps {
    isUnavailable?: boolean;
    link: ReactNode;
    children?: ReactNode;
}

const StyledUnavaliableContainer = styled.div`
    position: relative;
    z-index: 0;
    padding: 0 22px;
    margin: 0 -22px;
    border-radius: 6px;
`;

const StyledVeil = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    background-color: #00000095;
    cursor: not-allowed;
`;

export const UnavailableContainer: FC<isUnavailableContaineProps> = ({ isUnavailable = false, link, children }) => {
    return (
        <StyledUnavaliableContainer>
            {isUnavailable && <StyledVeil>{link}</StyledVeil>}
            {children}
        </StyledUnavaliableContainer>
    );
};
