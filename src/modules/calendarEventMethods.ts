import { addMinutes, differenceInMinutes, startOfDay } from 'date-fns';
import { PrismaPromise } from '@prisma/client';

import { prisma } from '../utils/prisma';

import { calendarRecurrenceMethods } from './calendarRecurrenceMethods';
import { calendarMethods } from './calendarMethods';
import {
    CalendarData,
    CalendarEventCreateResult,
    CalendarEventUpdateResult,
    CreateCalendarEvent,
    GetCalendarEventsForRange,
    UpdateCalendarEvent,
    UpdateCalendarException,
} from './calendarTypes';

async function createEvent(params: CreateCalendarEvent, userId: number): Promise<CalendarEventCreateResult> {
    const { date, title, duration, description = '', recurrence } = params;
    const rule = calendarRecurrenceMethods.buildRule({ startDate: date, recurrence });

    const event = await calendarMethods.createEvent({
        eventDetails: { create: { title, description, duration } },
        rule,
        creator: {
            connect: {
                id: userId,
            },
        },
    });

    return { eventId: event.id };
}

async function getEventsForDateRange({
    startDate,
    endDate,
    creatorIds,
}: GetCalendarEventsForRange): Promise<CalendarData> {
    const events = await calendarMethods.getAllEvents(creatorIds);

    return calendarRecurrenceMethods.expandEvents(events, startDate, endDate);
}

async function getEventRule(eventId: string): Promise<string> {
    const event = await calendarMethods.getEventById(eventId);

    return event.rule;
}

async function updateEventSeries(params: UpdateCalendarEvent): Promise<CalendarEventUpdateResult> {
    const { eventId, title, duration, description, date, originalDate } = params;

    let nextRule: string | undefined;

    const transactionOperations: PrismaPromise<unknown>[] = [];

    if (date) {
        const rule = await getEventRule(eventId);
        const seriesStartDate = calendarRecurrenceMethods.getStartDate(rule);
        const dateDiffInMinutes = differenceInMinutes(date, originalDate);

        nextRule = calendarRecurrenceMethods.updateRule(rule, {
            startDate: addMinutes(seriesStartDate, dateDiffInMinutes),
        });

        transactionOperations.push(
            calendarMethods.shiftEventExceptionOriginalDates(eventId, dateDiffInMinutes),
            calendarMethods.shiftEventCancellationOriginalDates(eventId, dateDiffInMinutes),
        );
    }

    transactionOperations.push(
        calendarMethods.updateEvent(eventId, {
            rule: nextRule,
            eventDetails: {
                update: {
                    description,
                    title,
                    duration,
                },
            },
        }),
    );

    await prisma.$transaction(transactionOperations);

    return {
        eventId,
    };
}

const getDateBeforeDay = (day: Date) => addMinutes(startOfDay(day), -1);

async function splitEventSeries(params: UpdateCalendarEvent, userId: number): Promise<CalendarEventUpdateResult> {
    const { eventId, title, duration, description, date, originalDate } = params;

    // TODO: Should just use the same creator instead
    const { rule, creator, eventDetails } = await calendarMethods.getEventById(eventId);

    const missingCreatorUpdate = creator ? {} : { creator: { connect: { id: userId } } };

    const futureExceptionIds = await calendarMethods.findEventExceptionIds({
        eventId,
        originalDate: { gte: originalDate },
    });

    const futureCancellationIds = await calendarMethods.findEventCancellationIds({
        eventId,
        originalDate: { gte: originalDate },
    });

    const futureEvent = await calendarMethods.createEvent({
        rule: calendarRecurrenceMethods.updateRule(rule, {
            startDate: date ?? originalDate,
        }),
        eventDetails: {
            create: {
                title: title ?? eventDetails.title,
                description: description ?? eventDetails.description,
                duration: duration ?? eventDetails.duration,
            },
        },
        creator: {
            connect: {
                id: creator?.id ?? userId,
            },
        },
    });

    const updateOperations: PrismaPromise<unknown>[] = [
        calendarMethods.updateEvent(eventId, {
            rule: calendarRecurrenceMethods.updateRule(rule, { endDate: getDateBeforeDay(originalDate) }),
            ...missingCreatorUpdate,
        }),
        calendarMethods.updateEventExceptions(
            { id: { in: futureExceptionIds } },
            {
                eventId: futureEvent.id,
            },
        ),
        calendarMethods.updateEventCancellations(
            { id: { in: futureCancellationIds } },
            {
                eventId: futureEvent.id,
            },
        ),
    ];

    if (date) {
        const dateDiffInMinutes = differenceInMinutes(date, originalDate);

        updateOperations.push(
            calendarMethods.shiftEventExceptionOriginalDates(futureEvent.id, dateDiffInMinutes),
            calendarMethods.shiftEventCancellationOriginalDates(futureEvent.id, dateDiffInMinutes),
        );
    }

    await prisma.$transaction(updateOperations);

    return {
        eventId: futureEvent.id,
    };
}

async function createEventException(params: UpdateCalendarEvent): Promise<CalendarEventUpdateResult> {
    const { eventId, title, duration, description, date, originalDate } = params;

    const { eventDetails } = await calendarMethods.getEventById(eventId);

    const { id } = await calendarMethods.createEventException({
        date: date ?? originalDate,
        originalDate,
        eventDetails: {
            create: {
                title: title ?? eventDetails.title,
                description: description ?? eventDetails.description,
                duration: duration ?? eventDetails.duration,
            },
        },
        event: {
            connect: {
                id: eventId,
            },
        },
    });

    return { eventId, exceptionId: id };
}

async function updateEventException(params: UpdateCalendarException): Promise<CalendarEventUpdateResult> {
    const { eventId, exceptionId, title, duration, description, date } = params;

    const eventException = await calendarMethods.updateEventException(exceptionId, {
        date,
        eventDetails: {
            update: {
                title,
                description,
                duration,
            },
        },
    });

    return { eventId, exceptionId: eventException.id };
}

async function stopEventSeries(eventId: string, originalDate: Date): Promise<void> {
    const { rule } = await calendarMethods.getEventById(eventId);

    await calendarMethods.updateEvent(eventId, {
        rule: calendarRecurrenceMethods.updateRule(rule, {
            endDate: getDateBeforeDay(originalDate),
        }),
        exceptions: {
            deleteMany: {
                originalDate: {
                    gte: originalDate,
                },
            },
        },
        cancellations: {
            deleteMany: {
                originalDate: {
                    gte: originalDate,
                },
            },
        },
    });
}

async function cancelEventException(eventId: string, exceptionId: string): Promise<void> {
    const { originalDate } = await calendarMethods.getEventExceptionById(exceptionId);

    await calendarMethods.removeEventException(exceptionId);
    await calendarMethods.createEventCancellation({
        originalDate,
        event: {
            connect: { id: eventId },
        },
    });
}

async function createEventCancellation(eventId: string, originalDate: Date): Promise<void> {
    await calendarMethods.createEventCancellation({
        originalDate,
        event: {
            connect: { id: eventId },
        },
    });
}

async function removeEventSeries(eventId: string): Promise<void> {
    await calendarMethods.removeEvent(eventId);
}

export const calendarEventMethods = {
    createEvent,
    getEventsForDateRange,
    updateEventSeries,
    createEventException,
    updateEventException,
    splitEventSeries,
    stopEventSeries,
    cancelEventException,
    createEventCancellation,
    removeEventSeries,
};
