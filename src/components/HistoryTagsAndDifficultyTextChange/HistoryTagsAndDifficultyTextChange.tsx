import { nullable, Text } from '@taskany/bricks';
import styled from 'styled-components';

import { tr } from './HistoryTagsAndDifficultyTextChange.i18n';

interface HistoryChangeProps {
    from?: string | null;
    to?: string | null;
}

const StyledFlexReset = styled.div`
    width: 100%;
`;

export const HistoryTagsAndDifficultyTextChange: React.FC<HistoryChangeProps> = ({ from, to }) => (
    <StyledFlexReset>
        {nullable(from, () => (
            <div>
                <Text as="span" size="xs" strike>
                    {tr('from')}: {from}
                </Text>
            </div>
        ))}
        {nullable(to, () => (
            <div>
                <Text as="span" size="xs">
                    {tr('to')}: {to}
                </Text>
            </div>
        ))}
    </StyledFlexReset>
);
