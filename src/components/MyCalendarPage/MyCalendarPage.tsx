import { InterviewSectionSlotCalendar } from '../InterviewSectionSlotCalendar/InterviewSectionSlotCalendar';
import { LayoutMain } from '../LayoutMain';

import { tr } from './MyCalendarPage.i18n';

export const MyCalendarPage = () => {
    return (
        <LayoutMain pageTitle={tr('Calendar')}>
            <InterviewSectionSlotCalendar />
        </LayoutMain>
    );
};
