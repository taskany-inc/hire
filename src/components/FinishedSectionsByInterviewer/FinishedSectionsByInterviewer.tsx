import { HireStream } from '@prisma/client';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { backgroundColor, gray6 } from '@taskany/colors';
import { Text } from '@taskany/bricks';

import { FinishedSectionsByInterviewerOutput } from '../../modules/analyticsQueriesTypes';
import { useFinishedSectionsByInterviewer } from '../../modules/analyticsQueriesHooks';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { useAnalyticsFilterUrlParams } from '../../hooks/useAnalyticsFilterUrlParams';

import { tr } from './FinishedSectionsByInterviewer.i18n';

interface FinishedSectionsByInterviewerProps {
    allStreams: HireStream[];
}

const Chart = ({ data }: { data: FinishedSectionsByInterviewerOutput }) => {
    return (
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                    cursor={{ fill: gray6 }}
                    wrapperStyle={{ border: 'none', outline: 'none' }}
                    contentStyle={{ backgroundColor }}
                />
                <Bar dataKey="section" fill="#31b5c4" label={{ fill: '#5a5a5a' }} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export const FinishedSectionsByInterviewer = ({ allStreams }: FinishedSectionsByInterviewerProps) => {
    const { startDate, endDate, hireStreams: choosenStreams } = useAnalyticsFilterUrlParams(allStreams);

    const hireStreams = choosenStreams.length === 0 ? allStreams : choosenStreams;

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
            <Text size="xl" style={{ marginTop: 10, marginLeft: 30 }}>
                {tr('The number of sections conducted by the interviewers (with tasks)')}
            </Text>
            <QueryResolver queries={[dataWithTasksQuery]}>{([data]) => <Chart data={data} />}</QueryResolver>

            <Text size="xl" style={{ marginTop: 10, marginLeft: 30 }}>
                {tr('The number of sections conducted by the interviewers (without tasks)')}
            </Text>
            <QueryResolver queries={[dataNoTasksQuery]}>{([data]) => <Chart data={data} />}</QueryResolver>
        </>
    );
};
