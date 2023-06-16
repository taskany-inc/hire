import { addMinutes, differenceInMinutes, startOfDay } from 'date-fns';
import { PrismaPromise } from '@prisma/client';

import { prisma } from '../..';

import { calendarRecurrenceService } from './calendar-recurrence-service';
import { calendarDbService } from './calendar-db-service';
import {
    CalendarData,
    CalendarEventCreateResult,
    CalendarEventUpdateResult,
    CreateCalendarEvent,
    GetCalendarEventsForRange,
    UpdateCalendarEvent,
    UpdateCalendarException,
} from './calendar-types';

async function createEvent(params: CreateCalendarEvent, userId: number): Promise<CalendarEventCreateResult> {
    const { date, title, duration, description = '', recurrence } = params;
    const rule = calendarRecurrenceService.buildRule({ startDate: date, recurrence });

    const event = await calendarDbService.createEvent({
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
    const events = await calendarDbService.getAllEvents(creatorIds);

    return calendarRecurrenceService.expandEvents(events, startDate, endDate);
}

async function getEventRule(eventId: string): Promise<string> {
    const event = await calendarDbService.getEventById(eventId);

    return event.rule;
}

async function updateEventSeries(params: UpdateCalendarEvent): Promise<CalendarEventUpdateResult> {
    const { eventId, title, duration, description, date, originalDate } = params;

    let nextRule: string | undefined;

    const transactionOperations: PrismaPromise<unknown>[] = [];

    if (date) {
        const rule = await getEventRule(eventId);
        const seriesStartDate = calendarRecurrenceService.getStartDate(rule);
        const dateDiffInMinutes = differenceInMinutes(date, originalDate);

        nextRule = calendarRecurrenceService.updateRule(rule, {
            startDate: addMinutes(seriesStartDate, dateDiffInMinutes),
        });

        transactionOperations.push(
            calendarDbService.shiftEventExceptionOriginalDates(eventId, dateDiffInMinutes),
            calendarDbService.shiftEventCancellationOriginalDates(eventId, dateDiffInMinutes),
        );
    }

    transactionOperations.push(
        calendarDbService.updateEvent(eventId, {
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
    const { rule, creator, eventDetails } = await calendarDbService.getEventById(eventId);

    const missingCreatorUpdate = creator ? {} : { creator: { connect: { id: userId } } };

    const futureExceptionIds = await calendarDbService.findEventExceptionIds({
        eventId,
        originalDate: { gte: originalDate },
    });

    const futureCancellationIds = await calendarDbService.findEventCancellationIds({
        eventId,
        originalDate: { gte: originalDate },
    });

    const futureEvent = await calendarDbService.createEvent({
        rule: calendarRecurrenceService.updateRule(rule, {
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
        calendarDbService.updateEvent(eventId, {
            rule: calendarRecurrenceService.updateRule(rule, { endDate: getDateBeforeDay(originalDate) }),
            ...missingCreatorUpdate,
        }),
        calendarDbService.updateEventExceptions(
            { id: { in: futureExceptionIds } },
            {
                eventId: futureEvent.id,
            },
        ),
        calendarDbService.updateEventCancellations(
            { id: { in: futureCancellationIds } },
            {
                eventId: futureEvent.id,
            },
        ),
    ];

    if (date) {
        const dateDiffInMinutes = differenceInMinutes(date, originalDate);

        updateOperations.push(
            calendarDbService.shiftEventExceptionOriginalDates(futureEvent.id, dateDiffInMinutes),
            calendarDbService.shiftEventCancellationOriginalDates(futureEvent.id, dateDiffInMinutes),
        );
    }

    await prisma.$transaction(updateOperations);

    return {
        eventId: futureEvent.id,
    };
}

async function createEventException(params: UpdateCalendarEvent): Promise<CalendarEventUpdateResult> {
    const { eventId, title, duration, description, date, originalDate } = params;

    const { eventDetails } = await calendarDbService.getEventById(eventId);

    const { id } = await calendarDbService.createEventException({
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

    const eventException = await calendarDbService.updateEventException(exceptionId, {
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
    const { rule } = await calendarDbService.getEventById(eventId);

    await calendarDbService.updateEvent(eventId, {
        rule: calendarRecurrenceService.updateRule(rule, {
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
    const { originalDate } = await calendarDbService.getEventExceptionById(exceptionId);

    await calendarDbService.removeEventException(exceptionId);
    await calendarDbService.createEventCancellation({
        originalDate,
        event: {
            connect: { id: eventId },
        },
    });
}

async function createEventCancellation(eventId: string, originalDate: Date): Promise<void> {
    await calendarDbService.createEventCancellation({
        originalDate,
        event: {
            connect: { id: eventId },
        },
    });
}

async function removeEventSeries(eventId: string): Promise<void> {
    await calendarDbService.removeEvent(eventId);
}

export const calendarEventService = {
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
