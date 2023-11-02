import styled from 'styled-components';
import { gapM, gray4 } from '@taskany/colors';

interface PageSepProps {
    width?: number;
}

export const PageSep = styled.div<PageSepProps>`
    border-top: 1px solid ${gray4};
    margin: ${gapM} 0;

    width: ${({ width }) => (width ? `${width}px` : 'auto')};
`;
