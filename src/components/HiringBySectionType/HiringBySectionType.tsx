import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardInfo, CardContent, Text } from '@taskany/bricks/harmony';

import { useHiringBySectionType } from '../../modules/analyticsQueriesHooks';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { useAnalyticsFilterUrlParams } from '../../hooks/useAnalyticsFilterUrlParams';
import { analyticsPalette } from '../../utils/analyticsPalette';

import { tr } from './HiringBySectionType.i18n';

interface HiringBySectionTypeProps {
    hireStreamName: string;
}

export const HiringBySectionType = ({ hireStreamName }: HiringBySectionTypeProps) => {
    const { startDate, endDate } = useAnalyticsFilterUrlParams();

    const dataQuery = useHiringBySectionType({
        from: startDate,
        to: endDate,
        hireStreamName,
    });

    return (
        <Card>
            <CardInfo>
                <Text size="xl">{tr('Hiring by section type')}</Text>
            </CardInfo>
            <CardContent>
                <QueryResolver queries={[dataQuery]}>
                    {([data]) => (
                        <ResponsiveContainer width="100%" height={500}>
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={analyticsPalette.text} />
                                <XAxis dataKey="sectionType" />
                                <YAxis />
                                <Tooltip
                                    cursor={{ fill: analyticsPalette.tooltipCursor }}
                                    contentStyle={{ backgroundColor: analyticsPalette.tooltipBg }}
                                />
                                <Bar dataKey="hire" stackId="a" fill={analyticsPalette.lightGreen}>
                                    <LabelList dataKey="hire" fill={analyticsPalette.gray} />
                                </Bar>
                                <Bar dataKey="noHire" stackId="a" fill={analyticsPalette.lightOrange}>
                                    <LabelList dataKey="noHire" fill={analyticsPalette.gray} />
                                    <LabelList position="top" fill={analyticsPalette.text} />
                                </Bar>
                                <Legend />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </QueryResolver>
            </CardContent>
        </Card>
    );
};
