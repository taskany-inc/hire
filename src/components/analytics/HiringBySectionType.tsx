import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { backgroundColor, gray8 } from '@taskany/colors';
import { Text } from '@taskany/bricks';

import { useAnalyticsFilterContext } from '../../contexts/analytics-filter-context';
import { useHiringBySectionType } from '../../hooks/analytics-queries-hooks';
import { QueryResolver } from '../QueryResolver';

type HiringBySectionTypeProps = {
    hireStreamName: string;
};

export const HiringBySectionType = ({ hireStreamName }: HiringBySectionTypeProps) => {
    const { startDate, endDate } = useAnalyticsFilterContext();

    const dataQuery = useHiringBySectionType({ from: startDate, to: endDate, hireStreamName });

    return (
        <>
            <Text size="xl" style={{ marginTop: 10, marginLeft: 40 }}>
                Hiring by section type
            </Text>
            <QueryResolver queries={[dataQuery]}>
                {([data]) => (
                    <ResponsiveContainer width="100%" height={500}>
                        <BarChart
                            data={data}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 30,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FFFFFF66" />
                            <XAxis dataKey="sectionType" />
                            <YAxis />
                            <Tooltip
                                cursor={{ fill: `${gray8}77` }}
                                wrapperStyle={{ border: 'none', outline: 'none' }}
                                contentStyle={{ backgroundColor }}
                            />
                            <Bar dataKey="hire" stackId="a" fill="#18d891">
                                <LabelList dataKey="hire" />
                            </Bar>
                            <Bar dataKey="noHire" stackId="a" fill="#d84518">
                                <LabelList dataKey="noHire" />
                                <LabelList position="top" fill="white" />
                            </Bar>
                            <Legend />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </QueryResolver>
        </>
    );
};
