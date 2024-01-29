import { nullable, Text } from '@taskany/bricks';
import { gapXs, gray8 } from '@taskany/colors';
import styled from 'styled-components';

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    name: string;
    timeAgo: string;
}

const StyledCardHeader = styled.div`
    display: inline-flex;
    gap: ${gapXs};
`;

export const CardHeaderComment: React.FC<CardHeaderProps> = ({ name, timeAgo }) => {
    return (
        <StyledCardHeader>
            {nullable(name, (n) => (
                <>
                    <Text size="xs" color={gray8} weight="bold">
                        {n}
                    </Text>
                    <Text size="xs" color={gray8}>
                        {timeAgo}
                    </Text>
                </>
            ))}
        </StyledCardHeader>
    );
};
