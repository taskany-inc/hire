import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HireStream } from '@prisma/client';
import { Card, CardContent, CardInfo, Text } from '@taskany/bricks/harmony';

import { useHiringFunnel } from '../../modules/analyticsQueriesHooks';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { useAnalyticsFilterUrlParams } from '../../hooks/useAnalyticsFilterUrlParams';
import { analyticsPalette } from '../../utils/analyticsPalette';

import { tr } from './HiringFunnel.i18n';

interface HiringFunnelProps {
    allStreams: HireStream[];
}

export const HiringFunnel = ({ allStreams }: HiringFunnelProps) => {
    const {
        values: { startDate, endDate, streams },
    } = useAnalyticsFilterUrlParams(allStreams);

    const hireStreams = streams ?? allStreams;
    const hiringFunnelQuery = useHiringFunnel({
        from: startDate,
        to: endDate,
        hireStreams: hireStreams.map((s) => s.name),
    });

    return (
        <>
            <Card>
                <CardInfo>
                    <Text size="xl">{tr('Hiring funnel')}</Text>
                </CardInfo>
                <CardContent>
                    <QueryResolver queries={[hiringFunnelQuery]}>
                        {([hiringFunnel]) => (
                            <ResponsiveContainer width="100%" height={500}>
                                <BarChart data={hiringFunnel}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="label" />
                                    <YAxis />
                                    <Tooltip
                                        cursor={{ fill: analyticsPalette.tooltipCursor }}
                                        contentStyle={{ backgroundColor: analyticsPalette.tooltipBg }}
                                    />
                                    <Bar
                                        dataKey="value"
                                        fill={analyticsPalette.lightBlue}
                                        label={{ fill: analyticsPalette.gray }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </QueryResolver>
                </CardContent>
            </Card>
        </>
    );
};
