import { HireStream } from '@prisma/client';
import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts';
import { Card, CardContent, CardInfo, Text } from '@taskany/bricks/harmony';

import { useCandidatesRejectReasons } from '../../modules/analyticsQueriesHooks';
import { getPieChartSliceColor, mapInterval, RADIAN } from '../../utils';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { useAnalyticsFilterUrlParams } from '../../hooks/useAnalyticsFilterUrlParams';
import { analyticsPalette } from '../../utils/analyticsPalette';

import { tr } from './CandidatesRejectReasons.i18n';
import s from './CandidatesRejectReasons.module.css';

interface Props {
    allStreams: HireStream[];
}

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.3;
    const x = cx + radius * 1.7 * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * 1.7 * Math.sin(-midAngle * RADIAN);

    const percentRounded = Math.round(percent * 100);

    return (
        <text x={x} y={y} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fill={analyticsPalette.text}>
            {`${value} (${percentRounded}%)`}
        </text>
    );
};

const formatLegend = (_value: any, entry: any) => {
    const percent = Math.round((entry?.payload?.percent || 0) * 100);

    return `${entry?.payload?.rejectreason}: ${entry?.payload?.candidate} (${percent}%)`;
};

export const CandidatesRejectReasons = ({ allStreams }: Props) => {
    const { startDate, endDate, hireStreams: choosenStreams } = useAnalyticsFilterUrlParams(allStreams);
    const hireStreams = choosenStreams.length === 0 ? allStreams : choosenStreams;

    const dataQuery = useCandidatesRejectReasons({
        from: startDate,
        to: endDate,
        hireStreams: hireStreams.map((s) => s.name),
    });

    return (
        <Card>
            <CardInfo>
                <Text size="xl">{tr('Reasons for not hiring')}</Text>
            </CardInfo>
            <CardContent>
                <QueryResolver queries={[dataQuery]}>
                    {([data]) => (
                        <div className={s.CandidatesRejectReasonsChartWrapper}>
                            <PieChart width={700} height={500}>
                                <Pie
                                    data={data}
                                    dataKey="candidate"
                                    label={renderCustomizedLabel}
                                    labelLine={false}
                                    innerRadius={100}
                                >
                                    {data.map((item, i) => (
                                        <Cell
                                            key={item.rejectreason}
                                            fill={getPieChartSliceColor(mapInterval(0, data.length, 3, 5, i))}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value, _name, props) => [value, props.payload.payload.rejectreason]}
                                    itemStyle={{ color: analyticsPalette.text }}
                                    contentStyle={{ backgroundColor: analyticsPalette.tooltipBg }}
                                />
                                <Legend
                                    layout="vertical"
                                    verticalAlign="middle"
                                    align="right"
                                    formatter={formatLegend}
                                />
                            </PieChart>
                        </div>
                    )}
                </QueryResolver>
            </CardContent>
        </Card>
    );
};
