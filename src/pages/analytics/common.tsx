import { accessChecks } from '../../modules/accessChecks';
import { AnalyticsCommonPage } from '../../components/AnalyticsCommonPage/AnalyticsCommonPage';
import { createGetServerSideProps } from '../../utils/createGetSSRProps';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ ssg, session, handleAccessChecks }) => {
        await ssg.hireStreams.getAllowed.fetch();

        await handleAccessChecks(() => accessChecks.analytics.read(session));
    },
});

export default AnalyticsCommonPage;
