import { createGetServerSideProps } from '../../utils/createGetSSRProps';
import { accessChecks } from '../../modules/accessChecks';
import CandidatesPage from '../../components/CandidatesPage/CandidatesPage';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ ssg, session, handleAccessChecks }) => {
        await ssg.hireStreams.getAll.fetch();
        await ssg.candidates.getList.fetch({});
        await handleAccessChecks(() => accessChecks.candidate.readMany(session));
    },
});

export default CandidatesPage;
