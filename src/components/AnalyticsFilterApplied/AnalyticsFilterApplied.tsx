import { FiltersApplied } from '@taskany/bricks';
import { useMemo } from 'react';
import { HireStream } from 'prisma/prisma-client';
import { gray7 } from '@taskany/colors';
import styled from 'styled-components';

import { tr } from './AnalyticsFilterApplied.i18n';

interface AnalyticsFilterAppliedProps {
    hireStreams?: HireStream[];
    periodTitle?: string;
}

const StyledApplied = styled(FiltersApplied)`
    position: absolute;
`;

export const AnalyticsFilterApplied = ({ hireStreams, periodTitle }: AnalyticsFilterAppliedProps) => {
    const filterAppliedString = useMemo(() => {
        let result = '';

        if (periodTitle) {
            result += `${tr('Period')}: ${periodTitle}. `;
        }

        if (hireStreams?.length) {
            result += `${tr('Streams')}: ${hireStreams.map(({ name }) => name).join(', ')}`;
        }

        return result;
    }, [hireStreams, periodTitle]);

    return (
        <StyledApplied size="s" weight="bold" color={gray7}>
            {filterAppliedString}
        </StyledApplied>
    );
};
