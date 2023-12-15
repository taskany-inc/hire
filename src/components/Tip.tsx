import styled from 'styled-components';
import { gapM, gapS, gapXs, gray10, gray7, gray8 } from '@taskany/colors';
import { Text, nullable } from '@taskany/bricks';

interface TipProps {
    title?: string;
    icon?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

const StyledTip = styled(Text)`
    padding: ${gapM} ${gapXs} 0;
`;

const StyledTipIcon = styled.span`
    display: inline-block;
    vertical-align: middle;
    margin-right: ${gapS};
    color: ${gray10};
`;

const StyledTipTitle = styled(Text)`
    margin-right: ${gapS};
`;

export const Tip: React.FC<TipProps> = ({ children, title, icon, className }) => {
    return (
        <StyledTip size="s" color={gray7} className={className}>
            {nullable(icon, (i) => (
                <StyledTipIcon>{i}</StyledTipIcon>
            ))}

            {nullable(title, (t) => (
                <StyledTipTitle as="span" size="s" weight="bold" color={gray8}>
                    {t}
                </StyledTipTitle>
            ))}

            {children}
        </StyledTip>
    );
};
