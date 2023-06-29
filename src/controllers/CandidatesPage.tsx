import { QueryResolver } from '../components/QueryResolver';
import { CandidateListView } from '../components/candidates/CandidateListView';
import { CandidatesFilterBar } from '../components/candidates/CandidatesFilterBar';
import { LayoutMain } from '../components/layout/LayoutMain';
import { useHireStreams } from '../hooks/hire-streams-hooks';

import { tr } from './controllers.i18n';

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
