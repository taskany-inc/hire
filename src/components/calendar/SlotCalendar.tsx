import { addMinutes } from 'date-fns';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { Dispatch, SetStateAction } from 'react';
import { enGB } from 'date-fns/locale';
import { Calendar, CalendarProps, Components, dateFnsLocalizer, NavigateAction, View } from 'react-big-calendar';
import withDragAndDrop, { withDragAndDropProps } from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { textColor } from '@taskany/colors';

import { QueryResolver } from '../QueryResolver';
import { useCalendarEvents } from '../../hooks/calendar-events-hooks';
import { DateRange, formatLocalized, weekOptions } from '../../utils/date';
import { LoadingContainer } from '../LoadingContainer';
import { CalendarEventInstance } from '../../backend/modules/calendar/calendar-types';

import { SlotCalendarEvent } from './SlotCalendarEvent';
import { BigCalendarEvent } from './calendar-types';
import { SlotCalendarEventWrapper } from './SlotCalendarEventWrapper';

export type { stringOrDate, SlotInfo } from 'react-big-calendar';

/**
 *  Localization Options:
 */
const locales = {
    'en-GB': enGB,
};

const localizer = dateFnsLocalizer({
    format: formatLocalized,
    parse,
    startOfWeek: (date: Date) => startOfWeek(date, weekOptions),
    getDay,
    locales,
});

export const components: Components<BigCalendarEvent, never> = {
    event: SlotCalendarEvent,
    eventWrapper: SlotCalendarEventWrapper,
};

const ReactBigDragAndDropCalendar = withDragAndDrop(
    Calendar as React.ComponentType<CalendarProps<BigCalendarEvent, never>>,
);

const transformApiToBigCalendarEvents = ({
    date,
    exceptionId,
    duration,
    description,
    eventId,
    title,
    recurrence,
    interviewSection,
    creator,
}: CalendarEventInstance): BigCalendarEvent => {
    const start = new Date(date);

    return {
        eventId,
        exceptionId,
        start,
        end: addMinutes(start, duration),
        title,
        description,
        allDay: false,
        isRecurrent: recurrence.repeat !== 'never',
        interviewSection,
        creator,
    };
};

export type EventDropHandler = withDragAndDropProps<BigCalendarEvent>['onEventDrop'];

export interface SlotCalendarProps
    extends Partial<CalendarProps<BigCalendarEvent, never>>,
        withDragAndDropProps<BigCalendarEvent, never> {
    creatorIds: number[];
    isLoading: boolean;
    calendarDate: Date;
    setCalendarDate: Dispatch<SetStateAction<Date>>;
    calendarView: View;
    setCalendarView: Dispatch<SetStateAction<View>>;
    range: DateRange;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function SlotCalendar({
    creatorIds,
    isLoading,
    calendarDate,
    setCalendarDate,
    calendarView,
    setCalendarView,
    range,
    ...bigCalendarProps
}: SlotCalendarProps) {
    const calendarEventsQuery = useCalendarEvents({
        startDate: range.startDate,
        endDate: range.endDate,
        creatorIds,
    });

    const navigateToDateAndView = (nextDate: Date, view: View, action: NavigateAction): void => {
        const newView = action === 'DATE' ? 'day' : view;

        setCalendarDate(nextDate);
        setCalendarView(newView);
    };

    return (
        <QueryResolver queries={[calendarEventsQuery]}>
            {([apiEvents]) => {
                const events =
                    calendarView === 'agenda' ? apiEvents.filter((event) => event.interviewSection) : apiEvents;

                return (
                    <LoadingContainer isSpinnerVisible={isLoading}>
                        <ReactBigDragAndDropCalendar
                            localizer={localizer}
                            events={events.map(transformApiToBigCalendarEvents)}
                            onView={setCalendarView}
                            style={{ color: textColor, height: '100%', minHeight: '80vh' }}
                            date={calendarDate}
                            view={calendarView}
                            onNavigate={navigateToDateAndView}
                            views={['month', 'week', 'work_week', 'day', 'agenda']}
                            defaultView="work_week"
                            components={components}
                            culture="en-GB"
                            {...bigCalendarProps}
                        />
                    </LoadingContainer>
                );
            }}
        </QueryResolver>
    );
}
