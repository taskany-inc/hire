import { accessChecks } from '../../backend/access/access-checks';
import { AnalyticsFilterMenuBar } from '../../components/analytics/AnalyticsFilterMenuBar';
import { CandidatesByHireStream } from '../../components/analytics/CandidatesByHireStream';
import { CandidatesRejectReasons } from '../../components/analytics/CandidatesRejectReasons';
import { FinishedSectionsByInterviewer } from '../../components/analytics/FinishedSectionsByInterviewer';
import { HiringFunnel } from '../../components/analytics/HiringFunnel';
import { LayoutMain } from '../../components/layout/LayoutMain';
import { QueryResolver } from '../../components/QueryResolver';
import { AnalyticsFilterContextProvider } from '../../contexts/analytics-filter-context';
import { useHireStreams } from '../../hooks/hire-streams-hooks';
import { createGetServerSideProps } from '../../utils/create-get-ssr-props';
import { Paths } from '../../utils/paths';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ ssg, session, handleAccessChecks }) => {
        await ssg.hireStreams.getAllowed.fetch();

        await handleAccessChecks(() => accessChecks.analytics.read(session));
    },
});

export default () => {
    const hireStreamsQuery = useHireStreams();

    return (
        <AnalyticsFilterContextProvider>
            <QueryResolver queries={[hireStreamsQuery]}>
                {([hireStreams]) => (
                    <>
                        <LayoutMain
                            pageTitle="General charts"
                            aboveContainer={<AnalyticsFilterMenuBar hireStreams={hireStreams} />}
                            backlink={Paths.ANALYTICS}
                        />
                        <HiringFunnel allStreams={hireStreams} />
                        <FinishedSectionsByInterviewer allStreams={hireStreams} />
                        <CandidatesByHireStream allStreams={hireStreams} />
                        <CandidatesRejectReasons allStreams={hireStreams} />
                    </>
                )}
            </QueryResolver>
        </AnalyticsFilterContextProvider>
    );
};
