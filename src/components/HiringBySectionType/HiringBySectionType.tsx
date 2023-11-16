import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { backgroundColor, gray6 } from '@taskany/colors';
import { Text } from '@taskany/bricks';

import { useAnalyticsFilterContext } from '../../contexts/analyticsFilterContext';
import { useHiringBySectionType } from '../../modules/analyticsQueriesHooks';
import { QueryResolver } from '../QueryResolver/QueryResolver';

import { tr } from './HiringBySectionType.i18n';

type HiringBySectionTypeProps = {
    hireStreamName: string;
};

export const HiringBySectionType = ({ hireStreamName }: HiringBySectionTypeProps) => {
    const { startDate, endDate } = useAnalyticsFilterContext();

    const dataQuery = useHiringBySectionType({
        from: startDate,
        to: endDate,
        hireStreamName,
    });

    return (
        <>
            <Text size="xl" style={{ marginTop: 10, marginLeft: 40 }}>
                {tr('Hiring by section type')}
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
                                cursor={{ fill: gray6 }}
                                wrapperStyle={{ border: 'none', outline: 'none' }}
                                contentStyle={{ backgroundColor }}
                            />
                            <Bar dataKey="hire" stackId="a" fill="#18d891">
                                <LabelList dataKey="hire" fill="#5a5a5a" />
                            </Bar>
                            <Bar dataKey="noHire" stackId="a" fill="#d84518">
                                <LabelList dataKey="noHire" fill="#5a5a5a" />
                                <LabelList position="top" fill="#5a5a5a" />
                            </Bar>
                            <Legend />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </QueryResolver>
        </>
    );
};
