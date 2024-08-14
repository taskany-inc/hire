import { createGetServerSideProps } from '../../utils/createGetSSRProps';
import { accessChecks } from '../../modules/accessChecks';
import CandidatesKanbanPage from '../../components/CandidatesKanbanPage/CandidatesKanbanPage';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ ssg, session, handleAccessChecks }) => {
        await ssg.hireStreams.getManaged.fetch();
        await handleAccessChecks(() => accessChecks.candidate.readMany(session));
    },
});

export default CandidatesKanbanPage;
