import { differenceInMinutes } from 'date-fns';

export const defaultEventLengthInMinutes = 60;

export const toDate = (start: string | Date): Date => (typeof start === 'string' ? new Date(start) : start);

export function getEventDuration(start: string | Date, end: string | Date): number {
    return differenceInMinutes(toDate(end), toDate(start));
}
