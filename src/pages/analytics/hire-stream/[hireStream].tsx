import { accessChecks } from '../../../modules/accessChecks';
import { AnalyticsHireStreamPage } from '../../../components/AnalyticsHireStreamPage/AnalyticsHireStreamPage';
import { createGetServerSideProps } from '../../../utils/createGetSSRProps';

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
