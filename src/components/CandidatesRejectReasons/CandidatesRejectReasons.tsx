import { HireStream } from '@prisma/client';
import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts';
import styled from 'styled-components';
import { backgroundColor } from '@taskany/colors';
import { Text } from '@taskany/bricks';

import { useAnalyticsFilterContext } from '../../contexts/analyticsFilterContext';
import { useCandidatesRejectReasons } from '../../modules/analyticsQueriesHooks';
import { getPieChartSliceColor, mapInterval, RADIAN } from '../../utils';
import { QueryResolver } from '../QueryResolver/QueryResolver';

import { tr } from './CandidatesRejectReasons.i18n';

interface Props {
    allStreams: HireStream[];
}

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.3;
    const x = cx + radius * 1.7 * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * 1.7 * Math.sin(-midAngle * RADIAN);

    const percentRounded = Math.round(percent * 100);

    return (
        <text x={x} y={y} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fill="white">
            {`${value} (${percentRounded}%)`}
        </text>
    );
};

const formatLegend = (_value: any, entry: any) => {
    const percent = Math.round((entry?.payload?.percent || 0) * 100);

    return `${entry?.payload?.rejectreason}: ${entry?.payload?.candidate} (${percent}%)`;
};

const StyledChartWrapper = styled.div`
    /* stylelint-disable-next-line selector-nested-pattern */
    .recharts-default-legend {
        width: 0;
        overflow: visible;
    }

    /* stylelint-disable-next-line selector-nested-pattern */
    .recharts-legend-item {
        width: max-content;
    }
`;

export const CandidatesRejectReasons = ({ allStreams }: Props) => {
    const { startDate, endDate, hireStreams: choosenStreams } = useAnalyticsFilterContext();
    const hireStreams = choosenStreams.length === 0 ? allStreams : choosenStreams;

    const dataQuery = useCandidatesRejectReasons({
        from: startDate,
        to: endDate,
        hireStreams: hireStreams.map((s) => s.name),
    });

    return (
        <>
            <Text size="xl" style={{ marginTop: 10, marginLeft: 30 }}>
                {tr('Reasons for not hiring')}
            </Text>
            <QueryResolver queries={[dataQuery]}>
                {([data]) => (
                    <StyledChartWrapper>
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
                                itemStyle={{ color: 'white' }}
                                wrapperStyle={{ border: 'none', outline: 'none' }}
                                contentStyle={{ backgroundColor }}
                            />
                            <Legend layout="vertical" verticalAlign="middle" align="right" formatter={formatLegend} />
                        </PieChart>
                    </StyledChartWrapper>
                )}
            </QueryResolver>
        </>
    );
};
