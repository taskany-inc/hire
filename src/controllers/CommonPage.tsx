import { useHireStreams } from '../hooks/hire-streams-hooks';
import { QueryResolver } from '../components/QueryResolver';
import { AnalyticsFilterContextProvider } from '../contexts/analytics-filter-context';

import { LayoutMain } from '../components/layout/LayoutMain';
import { AnalyticsFilterMenuBar } from '../components/analytics/AnalyticsFilterMenuBar';
import { HiringFunnel } from '../components/analytics/HiringFunnel';
import { FinishedSectionsByInterviewer } from '../components/analytics/FinishedSectionsByInterviewer';
import { CandidatesByHireStream } from '../components/analytics/CandidatesByHireStream';
import { CandidatesRejectReasons } from '../components/analytics/CandidatesRejectReasons';
import { Paths } from '../utils/paths';

import { tr } from './controllers.i18n';

export const CommonPage = () => {
    const hireStreamsQuery = useHireStreams();

    return (
        <AnalyticsFilterContextProvider>
            <QueryResolver queries={[hireStreamsQuery]}>
                {([hireStreams]) => (
                    <>
                        <LayoutMain
                            pageTitle={tr('General charts')}
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
