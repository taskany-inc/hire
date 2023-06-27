import { accessChecks } from '../../backend/access/access-checks';
import { createGetServerSideProps } from '../../utils/create-get-ssr-props';

import NewCandidatePage from '../../controllers/NewCandidatePage';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ ssg, session, handleAccessChecks }) => {
        await ssg.candidates.getOutstaffVendors.fetch();

        await handleAccessChecks(() => accessChecks.candidate.create(session));
    },
});

export default NewCandidatePage;
