import { accessChecks } from '../../backend/access/access-checks';
import { CommonPage } from '../../controllers/CommonPage';
import { createGetServerSideProps } from '../../utils/create-get-ssr-props';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ ssg, session, handleAccessChecks }) => {
        await ssg.hireStreams.getAllowed.fetch();

        await handleAccessChecks(() => accessChecks.analytics.read(session));
    },
});

export default CommonPage;
