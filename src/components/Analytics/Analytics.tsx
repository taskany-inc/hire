import React from 'react';
import styled from 'styled-components';

import { useAllowedHireStreams } from '../../modules/hireStreamsHooks';
import { Paths } from '../../utils/paths';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { CardHeader } from '../CardHeader';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { HireStreamAnalyticsList } from '../HireStreamAnalyticsList';
import { Card } from '../Card';

import { tr } from './Analytics.i18n';

const StyledCard = styled(Card)`
    width: max-content;
    margin-bottom: 6px;
`;

export const Analytics = () => {
    const hireStreamsQuery = useAllowedHireStreams();

    return (
        <LayoutMain pageTitle={tr('Analytics')}>
            <StyledCard>
                <CardHeader title={tr('General charts')} link={Paths.ANALYTICS_COMMON} />
            </StyledCard>

            <QueryResolver queries={[hireStreamsQuery]}>
                {([hireStreams]) => <HireStreamAnalyticsList hireStreams={hireStreams} />}
            </QueryResolver>
        </LayoutMain>
    );
};
