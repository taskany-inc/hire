import { differenceInMinutes } from 'date-fns';
import { User } from '@prisma/client';
import { Event } from 'react-big-calendar';

import { SectionWithInterviewRelation } from '../modules/interviewTypes';

export const defaultEventLengthInMinutes = 60;

export const toDate = (start: string | Date): Date => (typeof start === 'string' ? new Date(start) : start);

export function getEventDuration(start: string | Date, end: string | Date): number {
    return differenceInMinutes(toDate(end), toDate(start));
}

export const userOfEvent = (user: User, creator: User | null) => ({
    email: creator?.email || user.email,
    name: creator?.name || user.name || undefined,
});

export interface BigCalendarEvent extends Event {
    eventId: string;
    exceptionId?: string;
    allDay: false;
    title: string;
    start: Date;
    end: Date;
    description: string;
    isRecurrent: boolean;
    interviewSection: SectionWithInterviewRelation | null;
    creator: User | null;
    unavailableDueToWeekLimit?: boolean;
    unavailableDueToDayLimit?: boolean;
}
