import { HireStream } from '@prisma/client';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { Card, CardContent, CardInfo, Text } from '@taskany/bricks/harmony';

import { useCandidatesByHireStream } from '../../modules/analyticsQueriesHooks';
import { getPieChartSliceColor, mapInterval, RADIAN } from '../../utils';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { useAnalyticsFilterUrlParams } from '../../hooks/useAnalyticsFilterUrlParams';
import { analyticsPalette } from '../../utils/analyticsPalette';

import { tr } from './CandidatesByHireStream.i18n';

interface CandidatesByHireStreamProps {
    allStreams: HireStream[];
}

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value, hirestream }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const xx = cx + radius * 2.1 * Math.cos(-midAngle * RADIAN);
    const yy = cy + radius * 2.1 * Math.sin(-midAngle * RADIAN);

    return (
        <>
            <text x={x} y={y} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${value} (${(percent * 100).toFixed(0)}%)`}
            </text>
            <text
                x={xx}
                y={yy}
                textAnchor={xx > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fill={analyticsPalette.text}
            >
                {hirestream}
            </text>
        </>
    );
};

export const CandidatesByHireStream = ({ allStreams }: CandidatesByHireStreamProps) => {
    const { startDate, endDate, hireStreams: choosenStreams } = useAnalyticsFilterUrlParams(allStreams);
    const hireStreams = choosenStreams.length === 0 ? allStreams : choosenStreams;

    const dataQuery = useCandidatesByHireStream({
        from: startDate,
        to: endDate,
        hireStreams: hireStreams.map((s) => s.name),
    });

    return (
        <Card>
            <CardInfo>
                <Text size="xl">{tr('Number of candidates in recruitment streams')}</Text>
            </CardInfo>
            <CardContent>
                <QueryResolver queries={[dataQuery]}>
                    {([data]) => (
                        <PieChart width={700} height={500}>
                            <Pie data={data} dataKey="candidate" label={renderCustomizedLabel} labelLine={false}>
                                {data.map((item, i) => (
                                    <Cell
                                        key={item.hirestream}
                                        fill={getPieChartSliceColor(mapInterval(0, data.length, 3, 5, i))}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value, _name, props) => [value, props.payload.payload.hirestream]}
                                itemStyle={{ color: analyticsPalette.text }}
                                contentStyle={{ backgroundColor: analyticsPalette.tooltipBg }}
                            />
                        </PieChart>
                    )}
                </QueryResolver>
            </CardContent>
        </Card>
    );
};
