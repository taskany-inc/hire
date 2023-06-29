import { accessChecks } from '../../backend/access/access-checks';

import { createGetServerSideProps } from '../../utils/create-get-ssr-props';
import { Analytics } from '../../controllers/Analytics';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ ssg, session, handleAccessChecks }) => {
        await ssg.hireStreams.getAll.fetch();

        await handleAccessChecks(() => accessChecks.analytics.read(session));
    },
});

export default Analytics;
