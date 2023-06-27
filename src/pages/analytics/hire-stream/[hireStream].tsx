import { accessChecks } from '../../../backend/access/access-checks';
import { GradesByInterviewer } from '../../../components/analytics/GradesByInterviewer';
import { HiringBySectionType } from '../../../components/analytics/HiringBySectionType';
import { AnalyticsFilterContextProvider } from '../../../contexts/analytics-filter-context';
import { HireStreamPage } from '../../../controllers/HireStreamPage';
import { InferServerSideProps } from '../../../types';
import { createGetServerSideProps } from '../../../utils/create-get-ssr-props';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    stringIds: { hireStream: true },
    action: async ({ ssg, session, stringIds, handleAccessChecks }) => {
        await ssg.hireStreams.getByName.fetch({
            hireStreamName: stringIds.hireStream,
        });

        await handleAccessChecks(() => accessChecks.analytics.read(session));
    },
});

export default ({ stringIds }: InferServerSideProps<typeof getServerSideProps>) => {
    return (
        <AnalyticsFilterContextProvider>
            <HireStreamPage />
            <HiringBySectionType hireStreamName={stringIds.hireStream} />
            <GradesByInterviewer hireStreamName={stringIds.hireStream} />
        </AnalyticsFilterContextProvider>
    );
};
