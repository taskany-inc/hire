import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardInfo, Text } from '@taskany/bricks/harmony';

import { useSectionTypeToGradesByInterviewer } from '../../modules/analyticsQueriesHooks';
import { getPieChartSliceColor, mapInterval } from '../../utils';
import { useGradeOptions } from '../../modules/gradesHooks';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { useAnalyticsFilterUrlParams } from '../../hooks/useAnalyticsFilterUrlParams';
import { analyticsPalette } from '../../utils/analyticsPalette';

import { tr } from './GradesByInterviewer.i18n';

interface Props {
    hireStreamName: string;
}

export const GradesByInterviewer = ({ hireStreamName }: Props) => {
    const {
        values: { startDate, endDate },
    } = useAnalyticsFilterUrlParams();
    const grades = (useGradeOptions().data ?? []).flat();
    const lastGrade = grades.at(-1);

    const dataQuery = useSectionTypeToGradesByInterviewer({
        from: startDate,
        to: endDate,
        hireStreamName,
    });

    return (
        <QueryResolver queries={[dataQuery]}>
            {([data]) => (
                <>
                    {Object.entries(data).map(([sectionType, sectionTypeData]) => (
                        <Card key={sectionType}>
                            <CardInfo>
                                <Text size="xl">
                                    {tr('Estimates in section type')} {sectionType}
                                </Text>
                            </CardInfo>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={500}>
                                    <BarChart data={sectionTypeData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip
                                            cursor={{ fill: analyticsPalette.tooltipCursor }}
                                            contentStyle={{ backgroundColor: analyticsPalette.tooltipBg }}
                                        />
                                        <Bar dataKey="grades.NO_HIRE" stackId={1} fill={getPieChartSliceColor(2)}>
                                            <LabelList dataKey="grades.NO_HIRE" fill={analyticsPalette.gray} />
                                        </Bar>
                                        {grades.map((grade, i) => (
                                            <Bar
                                                key={`${grade}-${i}`}
                                                dataKey={`grades.${grade}`}
                                                stackId={1}
                                                fill={getPieChartSliceColor(mapInterval(0, grades.length, 3, 5, i))}
                                            >
                                                <LabelList dataKey={`grades.${grade}`} fill={analyticsPalette.gray} />
                                                {grade === lastGrade && (
                                                    <LabelList position="top" fill={analyticsPalette.text} />
                                                )}
                                            </Bar>
                                        ))}
                                        <Legend formatter={(v: string) => v.slice(v.indexOf('.') + 1)} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    ))}
                </>
            )}
        </QueryResolver>
    );
};
