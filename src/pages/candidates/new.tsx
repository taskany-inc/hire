import { accessChecks } from '../../modules/accessChecks';
import { createGetServerSideProps } from '../../utils/createGetSSRProps';
import NewCandidatePage from '../../components/NewCandidatePage/NewCandidatePage';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ ssg, session, handleAccessChecks }) => {
        await ssg.candidates.getOutstaffVendors.fetch();

        await handleAccessChecks(() => accessChecks.candidate.create(session));
    },
});

export default NewCandidatePage;
