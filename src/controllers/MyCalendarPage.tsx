import { InterviewSectionSlotCalendar } from '../components/calendar/InterviewSectionSlotCalendar';
import { LayoutMain } from '../components/layout/LayoutMain';

import { tr } from './controllers.i18n';

export const MyCalendarPage = () => {
    return (
        <LayoutMain pageTitle={tr('Calendar')}>
            <InterviewSectionSlotCalendar />
        </LayoutMain>
    );
};
