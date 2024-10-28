import { RRule, Frequency, Options, RRuleSet, rrulestr } from 'rrule';
import { addMinutes, differenceInMinutes, getISODay, isSameMinute } from 'date-fns';

import {
    CalendarData,
    CalendarEventInstance,
    CalendarEventWithRelations,
    EventRecurrence,
    UnavailableUsersByWeekDay,
    UnavailableUsersForWholeWeek,
} from './calendarTypes';

export function parseRecurrenceParams(rrule: RRule): EventRecurrence {
    const { freq } = rrule.options;

    switch (freq) {
        case Frequency.DAILY:
            return {
                repeat: 'daily',
            };
        case Frequency.WEEKLY:
            return {
                repeat: 'weekly',
            };
        case Frequency.MONTHLY:
            return {
                repeat: 'monthly',
            };
        default:
            return {
                repeat: 'never',
            };
    }
}

const expandEvent =
    (
        startDate: Date,
        endDate: Date,
        unavailableUsersForWholeWeek?: UnavailableUsersForWholeWeek,
        unavailableUsersByWeekDay?: UnavailableUsersByWeekDay,
    ) =>
    (event: CalendarEventWithRelations): CalendarData => {
        const unavailableDueToWeekLimit =
            (event.creatorId && unavailableUsersForWholeWeek?.has(event.creatorId)) || undefined;

        const rrule = rrulestr(event.rule);
        const rruleSet = new RRuleSet();

        const recurrence = parseRecurrenceParams(rrule);

        rruleSet.rrule(rrule);

        event.exceptions.forEach((exception) => {
            rruleSet.exdate(exception.originalDate);
        });
        event.cancellations.forEach((cancellation) => {
            rruleSet.exdate(cancellation.originalDate);
        });

        const dates = rruleSet.between(startDate, endDate);

        return dates
            .map((date): CalendarEventInstance => {
                const weekDay = getISODay(date);
                const unavailableDueToDayLimit =
                    (event.creatorId && unavailableUsersByWeekDay?.[weekDay]?.has(event.creatorId)) || undefined;
                return {
                    ...event.eventDetails,
                    eventId: event.id,
                    date,
                    recurrence,
                    // Link to section is only available for exceptions
                    interviewSection: null,
                    creator: event.creator,
                    unavailableDueToWeekLimit,
                    unavailableDueToDayLimit,
                };
            })
            .concat(
                event.exceptions.map((exception): CalendarEventInstance => {
                    const weekDay = getISODay(exception.date);
                    const unavailableDueToDayLimit =
                        (event.creatorId && unavailableUsersByWeekDay?.[weekDay]?.has(event.creatorId)) || undefined;
                    return {
                        ...exception.eventDetails,
                        date: exception.date,
                        eventId: event.id,
                        exceptionId: exception.id,
                        recurrence,
                        interviewSection: exception.interviewSection,
                        creator: event.creator,
                        unavailableDueToWeekLimit,
                        unavailableDueToDayLimit,
                    };
                }),
            );
    };

const expandEvents = (
    events: CalendarEventWithRelations[],
    startDate: Date,
    endDate: Date,
    unavailableUsersForWholeWeek?: UnavailableUsersForWholeWeek,
    unavailableUsersByWeekDay?: UnavailableUsersByWeekDay,
): CalendarData => {
    return events.flatMap(expandEvent(startDate, endDate, unavailableUsersForWholeWeek, unavailableUsersByWeekDay));
};

interface RuleParams {
    startDate: Date;
    endDate?: Date;
    recurrence?: EventRecurrence;
}

const transformRecurrenceToRruleOptions = (params?: RuleParams): Partial<Pick<Options, 'freq' | 'until'>> => {
    const { startDate, endDate, recurrence } = params ?? {};

    switch (recurrence?.repeat) {
        case 'daily':
            return {
                freq: Frequency.DAILY,
                until: endDate,
            };
        case 'weekly':
            return {
                freq: Frequency.WEEKLY,
                until: endDate,
            };
        case 'monthly':
            return {
                freq: Frequency.MONTHLY,
                until: endDate,
            };
        case 'never':
            return {
                freq: Frequency.YEARLY,
                until: startDate,
            };
        default:
            return {};
    }
};

const buildRule = (params: RuleParams): string => {
    const rule = new RRule({
        dtstart: params.startDate,
        ...transformRecurrenceToRruleOptions(params),
    });

    return rule.toString();
};

const updateRule = (rule: string, params: Partial<RuleParams>): string => {
    const rRule = RRule.fromString(rule);
    const { dtstart, until, freq } = rRule.options;
    const { startDate, endDate = until } = params;

    // If endDate has already been set, and startDate has been changed, update it in the same way as endDate
    const endDateNeedsUpdate = until && startDate && !isSameMinute(startDate, dtstart);

    const nextRRule = new RRule({
        freq,
        dtstart: startDate ?? dtstart,
        until: endDateNeedsUpdate ? addMinutes(endDate as Date, differenceInMinutes(startDate, dtstart)) : endDate,
    });

    return nextRRule.toString();
};

function getStartDate(rule: string): Date {
    const rRule = RRule.fromString(rule);

    return rRule.options.dtstart;
}

export const calendarRecurrenceMethods = {
    expandEvents,
    buildRule,
    updateRule,
    getStartDate,
};
