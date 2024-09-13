import React from 'react';
import { Card, CardContent, CardInfo } from '@taskany/bricks/harmony';

import { useAllowedHireStreams } from '../../modules/hireStreamsHooks';
import { Paths, pageHrefs } from '../../utils/paths';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { CardHeader } from '../CardHeader/CardHeader';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { Link } from '../Link';
import { HireStreamList } from '../HireStreamList/HireStreamList';

import { tr } from './Analytics.i18n';
import s from './Analytics.module.css';

export const Analytics = () => {
    const hireStreamsQuery = useAllowedHireStreams();

    return (
        <LayoutMain pageTitle={tr('Analytics')}>
            <div>
                <Card className={s.AnalyticsCard}>
                    <CardInfo>
                        <CardHeader title={<Link href={Paths.ANALYTICS_COMMON}>{tr('General charts')}</Link>} />
                    </CardInfo>
                    <CardContent>{tr('All hire streams')}</CardContent>
                </Card>

                <QueryResolver queries={[hireStreamsQuery]}>
                    {([hireStreams]) => (
                        <HireStreamList
                            hireStreams={hireStreams}
                            getLink={(stream) => pageHrefs.analyticsHireStream(stream.name)}
                        />
                    )}
                </QueryResolver>
            </div>
        </LayoutMain>
    );
};
