import { endOfMonth, endOfWeek, format, formatDistance, formatISO, startOfMonth, startOfWeek } from 'date-fns';
import { enGB, ru } from 'date-fns/locale';
import type { View } from 'react-big-calendar';

import { TLocale } from './getLang';

export const distanceDate = (date: Date, locale: string): string =>
    formatDistance(date, new Date(), { locale: locale.includes('ru') ? ru : enGB, addSuffix: true });

/**
 * @example "14.10.2021"
 */
export const formatDateToLocaleString = (date: Date): string => format(date, 'P', { locale: enGB });

export const parseEntityDates = <T extends { updatedAt: Date | string; createdAt: Date | string }>(data: T): T => ({
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
});

export const toIsoDateString = (date: Date): string => formatISO(date, { representation: 'date' });

export const formatTime = (date: Date): string => format(date, 'p', { locale: enGB });

export const formatLocalized = (date: Date, toFormat: string): string => format(date, toFormat, { locale: enGB });

export const weekOptions: { weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 } = { weekStartsOn: 1 };

export function firstVisibleDay(date: Date, view: View): Date {
    switch (view) {
        case 'day':
            return date;
        case 'week':
        case 'work_week':
            return startOfWeek(date, weekOptions);
        case 'month':
        default:
            return startOfWeek(startOfMonth(date), weekOptions);
    }
}
export function lastVisibleDay(date: Date, view: View): Date {
    switch (view) {
        case 'day':
            return date;
        case 'week':
        case 'work_week':
            return endOfWeek(date, weekOptions);
        case 'month':
        default:
            return endOfWeek(endOfMonth(date), weekOptions);
    }
}

export interface DateRange {
    startDate: Date;
    endDate: Date;
}

interface LocaleArg {
    locale: TLocale;
}

export const createLocaleDate = (date: Date, { locale }: LocaleArg): string =>
    new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
