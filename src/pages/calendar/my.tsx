import { accessChecks } from '../../backend/access/access-checks';
import { MyCalendarPage } from '../../controllers/MyCalendarPage';
import { createGetServerSideProps } from '../../utils/create-get-ssr-props';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ session, handleAccessChecks }) => {
        await handleAccessChecks(() => accessChecks.calendar.readMany(session));
    },
});

export default MyCalendarPage;
