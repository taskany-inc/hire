import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { backgroundColor, gray8 } from '@taskany/colors';
import { Text } from '@taskany/bricks';

import { useAnalyticsFilterContext } from '../../contexts/analytics-filter-context';
import { useSectionTypeToGradesByInterviewer } from '../../hooks/analytics-queries-hooks';
import { getPieChartSliceColor, mapEnum } from '../../utils';
import { QueryResolver } from '../QueryResolver';
import { SectionGrade, customGradesArray } from '../../utils/dictionaries';

import { tr } from './analytics.i18n';

type Props = {
    hireStreamName: string;
};

const customGradeColor = customGradesArray && customGradesArray.reduce((acc, rec, index) => {
    return {...acc, [rec]: getPieChartSliceColor(5 + index * 0.2)}
}, {})

const gradeColors: Record<keyof typeof SectionGrade | 'NO_HIRE', string | undefined> = {
    NO_HIRE: getPieChartSliceColor(2),
    HIRE: getPieChartSliceColor(3),
    JUNIOR: getPieChartSliceColor(3.8),
    MIDDLE: getPieChartSliceColor(4),
    SENIOR: getPieChartSliceColor(4.2),
    ...customGradeColor
};

const lastGrade = Object.keys(SectionGrade)[Object.keys(SectionGrade).length - 1];

export const GradesByInterviewer = ({ hireStreamName }: Props) => {
    const { startDate, endDate } = useAnalyticsFilterContext();

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
                        <>
                            <Text size="xl" style={{ marginTop: 10, marginLeft: 40 }}>
                                {tr('Estimates in section type')}
                                {sectionType}
                            </Text>
                            <ResponsiveContainer width="100%" height={500}>
                                <BarChart data={sectionTypeData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FFFFFF66" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip
                                        cursor={{ fill: `${gray8}77` }}
                                        wrapperStyle={{ border: 'none', outline: 'none' }}
                                        contentStyle={{ backgroundColor }}
                                    />
                                    <Bar dataKey="grades.NO_HIRE" stackId={1} fill={gradeColors.NO_HIRE}>
                                        <LabelList dataKey="grades.NO_HIRE" />
                                    </Bar>
                                    {mapEnum(SectionGrade, (grade) => (
                                        <Bar dataKey={`grades.${grade}`} stackId={1} fill={gradeColors[grade]}>
                                            <LabelList dataKey={`grades.${grade}`} />
                                            {grade === lastGrade && <LabelList position="top" fill="white" />}
                                        </Bar>
                                    ))}
                                    <Legend formatter={(v: string) => v.slice(v.indexOf('.') + 1)} />
                                </BarChart>
                            </ResponsiveContainer>
                        </>
                    ))}
                </>
            )}
        </QueryResolver>
    );
};
