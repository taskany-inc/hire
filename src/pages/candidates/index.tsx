import { createGetServerSideProps } from '../../utils/create-get-ssr-props';
import { accessChecks } from '../../backend/access/access-checks';
import CandidatesPage from '../../controllers/CandidatesPage';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ ssg, session, handleAccessChecks }) => {
        await ssg.hireStreams.getAll.fetch();
        await ssg.candidates.getList.fetch({});
        await handleAccessChecks(() => accessChecks.candidate.readMany(session));
    },
});

export default CandidatesPage;
