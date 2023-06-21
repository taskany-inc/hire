import { LayoutMain } from '../../components/layout/LayoutMain';
import { CandidateListView } from '../../components/candidates/CandidateListView';
import { CandidatesFilterBar } from '../../components/candidates/CandidatesFilterBar';
import { useHireStreams } from '../../hooks/hire-streams-hooks';
import { QueryResolver } from '../../components/QueryResolver';
import { createGetServerSideProps } from '../../utils/create-get-ssr-props';
import { accessChecks } from '../../backend/access/access-checks';

import { tr } from './candidates.i18n';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ ssg, session, handleAccessChecks }) => {
        await ssg.hireStreams.getAll.fetch();
        await ssg.candidates.getList.fetch({});
        await handleAccessChecks(() => accessChecks.candidate.readMany(session));
    },
});

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
