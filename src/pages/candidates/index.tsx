import { createGetServerSideProps } from '../../utils/createGetSSRProps';
import { accessChecks } from '../../modules/accessChecks';
import CandidatesPage from '../../components/CandidatesPage/CandidatesPage';
import { filtersSsrInit } from '../../utils/filters';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ ssg, session, handleAccessChecks, context }) => {
        await ssg.hireStreams.getAll.fetch();
        await ssg.candidates.getList.fetch({});
        await handleAccessChecks(() => accessChecks.candidate.readMany(session));

        const filters = await filtersSsrInit('Candidate', context, ssg);

        return {
            filters,
        };
    },
});

export default CandidatesPage;
