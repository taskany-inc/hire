import React from 'react';

import { useAllowedHireStreams } from '../../modules/hireStreamsHooks';
import { Paths } from '../../utils/paths';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { CardHeader } from '../CardHeader/CardHeader';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { HireStreamAnalyticsList } from '../HireStreamAnalyticsList';
import { Card } from '../Card/Card';
import { Link } from '../Link';

import { tr } from './Analytics.i18n';
import s from './Analytics.module.css';

export const Analytics = () => {
    const hireStreamsQuery = useAllowedHireStreams();

    return (
        <LayoutMain pageTitle={tr('Analytics')}>
            <Card className={s.AnalyticsCard}>
                <CardHeader title={<Link href={Paths.ANALYTICS_COMMON}>{tr('General charts')}</Link>} />
            </Card>

            <QueryResolver queries={[hireStreamsQuery]}>
                {([hireStreams]) => <HireStreamAnalyticsList hireStreams={hireStreams} />}
            </QueryResolver>
        </LayoutMain>
    );
};
