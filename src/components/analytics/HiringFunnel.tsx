import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HireStream } from '@prisma/client';
import { backgroundColor, gray8 } from '@taskany/colors';
import { Text } from '@taskany/bricks';

import { useHiringFunnel } from '../../hooks/analytics-queries-hooks';
import { useAnalyticsFilterContext } from '../../contexts/analytics-filter-context';
import { QueryResolver } from '../QueryResolver';

import { tr } from './analytics.i18n';

type HiringFunnelProps = {
    allStreams: HireStream[];
};

export const HiringFunnel = ({ allStreams }: HiringFunnelProps) => {
    const { startDate, endDate, hireStreams: choosenStreams } = useAnalyticsFilterContext();

    const hireStreams = choosenStreams.length === 0 ? allStreams : choosenStreams;
    const hiringFunnelQuery = useHiringFunnel({
        from: startDate,
        to: endDate,
        hireStreams: hireStreams.map((s) => s.name),
    });

    return (
        <>
            <Text size="xl" style={{ marginTop: 10, marginLeft: 30 }}>
                {tr('Hiring funnel')}
            </Text>
            <QueryResolver queries={[hiringFunnelQuery]}>
                {([hiringFunnel]) => (
                    <ResponsiveContainer width="100%" height={500}>
                        <BarChart
                            data={hiringFunnel}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 30,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip
                                cursor={{ fill: `${gray8}77` }}
                                wrapperStyle={{ border: 'none', outline: 'none' }}
                                contentStyle={{ backgroundColor }}
                            />
                            <Bar dataKey="value" fill="#31b5c4" label={{ fill: gray8 }} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </QueryResolver>
        </>
    );
};
