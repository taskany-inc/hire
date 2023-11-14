import { accessChecks } from '../../modules/accessChecks';
import { createGetServerSideProps } from '../../utils/createGetSSRProps';
import { Analytics } from '../../components/Analytics/Analytics';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ ssg, session, handleAccessChecks }) => {
        await ssg.hireStreams.getAllowed.fetch();

        await handleAccessChecks(() => accessChecks.analytics.read(session));
    },
});

export default Analytics;
