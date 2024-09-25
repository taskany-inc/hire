import { createGetServerSideProps } from '../../utils/createGetSSRProps';
import { filtersSsrInit } from '../../utils/filters';
import { accessChecks } from '../../modules/accessChecks';
import CandidatesKanbanPage from '../../components/CandidatesKanbanPage/CandidatesKanbanPage';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ ssg, session, handleAccessChecks, context }) => {
        await ssg.hireStreams.getManaged.fetch();
        await handleAccessChecks(() => accessChecks.candidate.readMany(session));

        const filters = await filtersSsrInit('Candidate', context, ssg);

        return {
            filters,
        };
    },
});

export default CandidatesKanbanPage;
