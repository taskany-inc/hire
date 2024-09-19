import { HireStream } from '@prisma/client';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardInfo, Text } from '@taskany/bricks/harmony';

import { FinishedSectionsByInterviewerOutput } from '../../modules/analyticsQueriesTypes';
import { useFinishedSectionsByInterviewer } from '../../modules/analyticsQueriesHooks';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { useAnalyticsFilterUrlParams } from '../../hooks/useAnalyticsFilterUrlParams';
import { analyticsPalette } from '../../utils/analyticsPalette';

import { tr } from './FinishedSectionsByInterviewer.i18n';

interface FinishedSectionsByInterviewerProps {
    allStreams: HireStream[];
}

const Chart = ({ data }: { data: FinishedSectionsByInterviewerOutput }) => {
    return (
        <ResponsiveContainer width="100%" height={500}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                    cursor={{ fill: analyticsPalette.tooltipCursor }}
                    contentStyle={{ backgroundColor: analyticsPalette.tooltipBg }}
                />
                <Bar dataKey="section" fill={analyticsPalette.lightBlue} label={{ fill: analyticsPalette.gray }} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export const FinishedSectionsByInterviewer = ({ allStreams }: FinishedSectionsByInterviewerProps) => {
    const {
        values: { startDate, endDate, streams },
    } = useAnalyticsFilterUrlParams(allStreams);

    const hireStreams = streams ?? allStreams;

    const dataWithTasksQuery = useFinishedSectionsByInterviewer({
        from: startDate,
        to: endDate,
        hireStreams: hireStreams.map((s) => s.name),
        hasTasks: true,
    });

    const dataNoTasksQuery = useFinishedSectionsByInterviewer({
        from: startDate,
        to: endDate,
        hireStreams: hireStreams.map((s) => s.name),
        hasTasks: false,
    });

    return (
        <>
            <Card>
                <CardInfo>
                    <Text size="xl">{tr('The number of sections conducted by the interviewers (with tasks)')}</Text>
                </CardInfo>
                <CardContent>
                    <QueryResolver queries={[dataWithTasksQuery]}>{([data]) => <Chart data={data} />}</QueryResolver>
                </CardContent>
            </Card>

            <Card>
                <CardInfo>
                    <Text size="xl">{tr('The number of sections conducted by the interviewers (without tasks)')}</Text>
                </CardInfo>
                <CardContent>
                    <QueryResolver queries={[dataNoTasksQuery]}>{([data]) => <Chart data={data} />}</QueryResolver>
                </CardContent>
            </Card>
        </>
    );
};
