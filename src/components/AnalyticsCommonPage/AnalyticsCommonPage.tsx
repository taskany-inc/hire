import { useHireStreams } from '../../modules/hireStreamsHooks';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { AnalyticsFilterBar } from '../AnalyticsFilterBar/AnalyticsFilterBar';
import { HiringFunnel } from '../HiringFunnel/HiringFunnel';
import { FinishedSectionsByInterviewer } from '../FinishedSectionsByInterviewer/FinishedSectionsByInterviewer';
import { CandidatesByHireStream } from '../CandidatesByHireStream/CandidatesByHireStream';
import { CandidatesRejectReasons } from '../CandidatesRejectReasons/CandidatesRejectReasons';
import { Paths } from '../../utils/paths';

import { tr } from './AnalyticsCommonPage.i18n';
import s from './AnalyticsCommonPage.module.css';

export const AnalyticsCommonPage = () => {
    const hireStreamsQuery = useHireStreams();

    return (
        <QueryResolver queries={[hireStreamsQuery]}>
            {([hireStreams]) => (
                <LayoutMain
                    pageTitle={tr('General charts')}
                    filterBar={<AnalyticsFilterBar hireStreams={hireStreams} title={tr('General charts')} />}
                    backlink={Paths.ANALYTICS}
                >
                    <div className={s.AnalyticsCommonPage}>
                        <HiringFunnel allStreams={hireStreams} />
                        <FinishedSectionsByInterviewer allStreams={hireStreams} />
                        <CandidatesByHireStream allStreams={hireStreams} />
                        <CandidatesRejectReasons allStreams={hireStreams} />
                    </div>
                </LayoutMain>
            )}
        </QueryResolver>
    );
};
