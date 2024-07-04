import { useHireStreams } from '../../modules/hireStreamsHooks';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { AnalyticsFilterMenuBar } from '../AnalyticsFilterMenuBar/AnalyticsFilterMenuBar';
import { HiringFunnel } from '../HiringFunnel/HiringFunnel';
import { FinishedSectionsByInterviewer } from '../FinishedSectionsByInterviewer/FinishedSectionsByInterviewer';
import { CandidatesByHireStream } from '../CandidatesByHireStream/CandidatesByHireStream';
import { CandidatesRejectReasons } from '../CandidatesRejectReasons/CandidatesRejectReasons';
import { Paths } from '../../utils/paths';

import { tr } from './AnalyticsCommonPage.i18n';

export const AnalyticsCommonPage = () => {
    const hireStreamsQuery = useHireStreams();

    return (
        <QueryResolver queries={[hireStreamsQuery]}>
            {([hireStreams]) => (
                <LayoutMain
                    pageTitle={tr('General charts')}
                    aboveContainer={<AnalyticsFilterMenuBar hireStreams={hireStreams} />}
                    backlink={Paths.ANALYTICS}
                >
                    <HiringFunnel allStreams={hireStreams} />
                    <FinishedSectionsByInterviewer allStreams={hireStreams} />
                    <CandidatesByHireStream allStreams={hireStreams} />
                    <CandidatesRejectReasons allStreams={hireStreams} />
                </LayoutMain>
            )}
        </QueryResolver>
    );
};
