import { useHireStreams } from '../../modules/hireStreamsHooks';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { CandidateListView } from '../CandidateListView/CandidateListView';
import { CandidatesFilterBar } from '../CandidatesFilterBar/CandidatesFilterBar';
import { LayoutMain } from '../LayoutMain';

import { tr } from './CandidatesPage.i18n';

const CandidatesPage = () => {
    const hireStreamsQuery = useHireStreams();

    return (
        <QueryResolver queries={[hireStreamsQuery]}>
            {([hireStreams]) => (
                <LayoutMain
                    pageTitle={tr('Candidates')}
                    aboveContainer={<CandidatesFilterBar hireStreams={hireStreams} />}
                >
                    <CandidateListView />
                </LayoutMain>
            )}
        </QueryResolver>
    );
};

export default CandidatesPage;
