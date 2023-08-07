import React from 'react';
import styled from 'styled-components';

import { LayoutMain } from '../components/layout/LayoutMain';
import { CardHeader } from '../components/card/CardHeader';
import { QueryResolver } from '../components/QueryResolver';
import { HireStreamAnalyticsList } from '../components/analytics/HireStreamAnalyticsList';
import { useHireStreams } from '../hooks/hire-streams-hooks';
import { Paths } from '../utils/paths';
import { Card } from '../components/card/Card';

import { tr } from './controllers.i18n';

const StyledCard = styled(Card)`
    width: max-content;
    margin-bottom: 6px;
`;

export const Analytics = () => {
    const hireStreamsQuery = useHireStreams();

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
