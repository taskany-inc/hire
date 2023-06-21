import { accessChecks } from '../../backend/access/access-checks';
import { InterviewSectionSlotCalendar } from '../../components/calendar/InterviewSectionSlotCalendar';
import { LayoutMain } from '../../components/layout/LayoutMain';
import { createGetServerSideProps } from '../../utils/create-get-ssr-props';

import { tr } from './calendar.i18n';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ session, handleAccessChecks }) => {
        await handleAccessChecks(() => accessChecks.calendar.readMany(session));
    },
});

export default function MyCalendarPage() {
    return (
        <LayoutMain pageTitle={tr('Calendar')}>
            <InterviewSectionSlotCalendar />
        </LayoutMain>
    );
}
