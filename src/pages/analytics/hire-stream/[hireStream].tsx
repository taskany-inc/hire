import { accessChecks } from '../../../backend/access/access-checks';
import { AnalyticsHireStreamPage } from '../../../controllers/AnalyticsHireStreamPage';
import { createGetServerSideProps } from '../../../utils/create-get-ssr-props';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    stringIds: { hireStream: true },
    action: async ({ ssg, session, stringIds, handleAccessChecks }) => {
        await ssg.hireStreams.getByName.fetch({
            hireStreamName: stringIds.hireStream,
        });

        await handleAccessChecks(() => accessChecks.analytics.read(session));
    },
});

export default AnalyticsHireStreamPage;
