import React, { FC } from 'react';
import styled from 'styled-components';

import { Spinner } from './Spinner';

const StyledContainer = styled.div`
    position: relative;
`;

const StyledSpinnerWrapper = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgba(37, 37, 37, 0.5);
    z-index: 1;
`;

export const LoadingContainer: FC<{ isSpinnerVisible: boolean, children: React.ReactNode }> = ({ isSpinnerVisible, children }) => {
    return (
        <StyledContainer>
            {isSpinnerVisible && (
                <StyledSpinnerWrapper>
                    <Spinner />
                </StyledSpinnerWrapper>
            )}
            {children}
        </StyledContainer>
    );
};
