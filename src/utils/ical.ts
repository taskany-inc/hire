import ical, { ICalAttendeeStatus, ICalCalendarMethod, ICalEventRepeatingFreq, ICalEventData } from 'ical-generator';
import { Frequency } from 'rrule';

import { minuteInSeconds } from '.';

interface CalendarEventData {
    method: ICalCalendarMethod;
    events: ICalEventData[];
}
interface CreateIcalEventDTO {
    start: Date;
    duration: number;
    users: { email: string; name?: string }[];
    id: string;
    summary: string;
    description: string;
    location?: string;
    url?: string;
    rule?: Frequency;
    exclude?: Date[];
    until?: Date;
    sequence?: number;
}

export const createIcalEventData = (data: CreateIcalEventDTO) => {
    const { start, duration, users, rule, exclude, until, ...restData } = data;
    const end = new Date(start.getTime() + duration * minuteInSeconds);

    const attendees = users.map((user) => ({ ...user, status: ICalAttendeeStatus.ACCEPTED }));

    const freq = (rrule: Frequency): ICalEventRepeatingFreq | undefined => {
        switch (rrule) {
            case Frequency.DAILY:
                return ICalEventRepeatingFreq.DAILY;
            case Frequency.WEEKLY:
                return ICalEventRepeatingFreq.WEEKLY;
            case Frequency.MONTHLY:
                return ICalEventRepeatingFreq.MONTHLY;
            default:
        }
    };
    const icalEventData: ICalEventData = {
        start,
        end,
        attendees,
        ...restData,
    };
    if (rule) {
        const frequency = freq(rule);
        if (frequency) icalEventData.repeating = { freq: frequency, exclude, until };
    }
    return icalEventData;
};

export const calendarEvents = (data: CalendarEventData) => {
    const calendar = ical();
    calendar.method(data.method);

    calendar.prodId({
        company: 'taskany',
        product: 'hire',
        language: 'EN',
    });

    calendar.events(data.events);

    return calendar.toString();
};
