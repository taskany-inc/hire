import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { backgroundColor, gray6 } from '@taskany/colors';
import { Text } from '@taskany/bricks';

import { useAnalyticsFilterContext } from '../../contexts/analyticsFilterContext';
import { useSectionTypeToGradesByInterviewer } from '../../modules/analyticsQueriesHooks';
import { getPieChartSliceColor, mapInterval } from '../../utils';
import { useGradeOptions } from '../../modules/gradesHooks';
import { QueryResolver } from '../QueryResolver/QueryResolver';

import { tr } from './GradesByInterviewer.i18n';

interface Props {
    hireStreamName: string;
}

export const GradesByInterviewer = ({ hireStreamName }: Props) => {
    const { startDate, endDate } = useAnalyticsFilterContext();
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
                        <div key={sectionType}>
                            <Text size="xl" style={{ marginTop: 10, marginLeft: 40 }}>
                                {tr('Estimates in section type')} {sectionType}
                            </Text>
                            <ResponsiveContainer width="100%" height={500}>
                                <BarChart data={sectionTypeData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip
                                        cursor={{ fill: gray6 }}
                                        wrapperStyle={{ border: 'none', outline: 'none' }}
                                        contentStyle={{ backgroundColor }}
                                    />
                                    <Bar dataKey="grades.NO_HIRE" stackId={1} fill={getPieChartSliceColor(2)}>
                                        <LabelList dataKey="grades.NO_HIRE" />
                                    </Bar>
                                    {grades.map((grade, i) => (
                                        <Bar
                                            key={`${grade}-${i}`}
                                            dataKey={`grades.${grade}`}
                                            stackId={1}
                                            fill={getPieChartSliceColor(mapInterval(0, grades.length, 3, 5, i))}
                                        >
                                            <LabelList dataKey={`grades.${grade}`} fill="#333333" />
                                            {grade === lastGrade && <LabelList position="top" fill="white" />}
                                        </Bar>
                                    ))}
                                    <Legend formatter={(v: string) => v.slice(v.indexOf('.') + 1)} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ))}
                </>
            )}
        </QueryResolver>
    );
};
