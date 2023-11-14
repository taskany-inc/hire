import { accessChecks } from '../../modules/accessChecks';
import { MyCalendarPage } from '../../components/MyCalendarPage/MyCalendarPage';
import { createGetServerSideProps } from '../../utils/createGetSSRProps';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ session, handleAccessChecks }) => {
        await handleAccessChecks(() => accessChecks.calendar.readMany(session));
    },
});

export default MyCalendarPage;
