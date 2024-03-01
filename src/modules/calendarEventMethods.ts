import { addMinutes, differenceInMinutes, startOfDay } from 'date-fns';
import { PrismaPromise, User } from '@prisma/client';
import { ICalCalendarMethod } from 'ical-generator';
import { RRule } from 'rrule';

import { prisma } from '../utils/prisma';
import { calendarEvents, createIcalEventData } from '../utils/ical';
import { userOfEvent } from '../utils/calendar';

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
import { sendMail } from './nodemailer';

async function createEvent(params: CreateCalendarEvent, user: User): Promise<CalendarEventCreateResult> {
    const { date, title, duration, description = '', recurrence } = params;
    const rule = calendarRecurrenceMethods.buildRule({ startDate: date, recurrence });

    const event = await calendarMethods.createEvent({
        eventDetails: { create: { title, description, duration } },
        rule,
        creator: {
            connect: {
                id: user.id,
            },
        },
    });

    const rRule = RRule.fromString(rule);

    const icalEventDataCreateEvent = createIcalEventData({
        id: event.id,
        users: [{ email: user.email, name: user.name || undefined }],
        start: date,
        duration,
        description: '',
        summary: title,
        rule: rRule.options.freq,
    });

    await sendMail({
        to: user.email,
        subject: title,
        text: '',
        icalEvent: calendarEvents({ method: ICalCalendarMethod.REQUEST, events: [icalEventDataCreateEvent] }),
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

async function updateEventSeries(params: UpdateCalendarEvent, user: User): Promise<CalendarEventUpdateResult> {
    const { eventId, title, duration, description, date, originalDate } = params;

    let nextRule: string | undefined;

    const transactionOperations: PrismaPromise<unknown>[] = [];

    const { rule, ...event } = await calendarMethods.getEventById(eventId);

    if (date) {
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
            sequence: { increment: 1 },
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

    const rRule = RRule.fromString(rule);
    const exclude = [
        ...event.exceptions.map((exception) => exception.originalDate),
        ...event.cancellations.map((cancelletion) => cancelletion.originalDate),
    ];

    const icalEventDataUpdateEvent = createIcalEventData({
        id: eventId,
        users: [{ email: user.email, name: user.name || undefined }],
        start: rRule.options.dtstart,
        duration: event.eventDetails.duration,
        description: event.eventDetails.description,
        summary: event.eventDetails.title,
        rule: rRule.options.freq,
        exclude,
        until: rRule.options.until || undefined,
        sequence: event.sequence + 1,
    });

    await sendMail({
        to: user.email,
        subject: event.eventDetails.title,
        text: '',
        icalEvent: calendarEvents({ method: ICalCalendarMethod.REQUEST, events: [icalEventDataUpdateEvent] }),
    });

    return {
        eventId,
    };
}

const getDateBeforeDay = (day: Date) => addMinutes(startOfDay(day), -1);

async function splitEventSeries(params: UpdateCalendarEvent, user: User): Promise<CalendarEventUpdateResult> {
    const { eventId, title, duration, description, date, originalDate } = params;

    // TODO: Should just use the same creator instead
    const { rule, creator, eventDetails, sequence } = await calendarMethods.getEventById(eventId);

    const missingCreatorUpdate = creator ? {} : { creator: { connect: { id: user.id } } };

    const futureExceptionIds = await calendarMethods.findEventExceptionIds({
        eventId,
        originalDate: { gte: date || originalDate },
    });

    const futureCancellationIds = await calendarMethods.findEventCancellationIds({
        eventId,
        originalDate: { gte: date || originalDate },
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
                id: creator?.id ?? user.id,
            },
        },
    });

    const updateOperations: PrismaPromise<unknown>[] = [
        calendarMethods.updateEvent(eventId, {
            rule: calendarRecurrenceMethods.updateRule(rule, { endDate: getDateBeforeDay(originalDate) }),
            sequence: { increment: 1 },
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

    const oldEvent = await calendarMethods.getEventById(eventId);

    const oldRRule = RRule.fromString(oldEvent.rule);
    const oldExclude = [
        ...oldEvent.exceptions.map((exception) => exception.originalDate),
        ...oldEvent.cancellations.map((cancelletion) => cancelletion.originalDate),
    ];

    const icalEventDataOldEvent = createIcalEventData({
        id: oldEvent.id,
        users: [userOfEvent(user, creator)],
        start: oldRRule.options.dtstart,
        duration: oldEvent.eventDetails.duration,
        description: oldEvent.eventDetails.description,
        summary: oldEvent.eventDetails.title,
        rule: oldRRule.options.freq,
        exclude: oldExclude.length ? oldExclude : undefined,
        until: getDateBeforeDay(originalDate),
        sequence: sequence + 1,
    });

    const newEvent = await calendarMethods.getEventById(futureEvent.id);

    const newRRule = RRule.fromString(newEvent.rule);
    const newExclude = [
        ...newEvent.exceptions.map((exception) => exception.originalDate),
        ...newEvent.cancellations.map((cancelletion) => cancelletion.originalDate),
    ];

    const icalEventDataNewEvent = createIcalEventData({
        id: newEvent.id,
        users: [userOfEvent(user, creator)],
        start: newRRule.options.dtstart,
        duration: newEvent.eventDetails.duration,
        description: newEvent.eventDetails.description,
        summary: newEvent.eventDetails.title,
        rule: newRRule.options.freq,
        exclude: newExclude.length ? newExclude : undefined,
        until: newRRule.options.until || undefined,
    });

    await sendMail({
        to: user.email,
        subject: oldEvent.eventDetails.title,
        text: '',
        icalEvent: calendarEvents({
            method: ICalCalendarMethod.REQUEST,
            events: [icalEventDataOldEvent],
        }),
    });

    await sendMail({
        to: user.email,
        subject: newEvent.eventDetails.title,
        text: '',
        icalEvent: calendarEvents({
            method: ICalCalendarMethod.REQUEST,
            events: [icalEventDataNewEvent],
        }),
    });

    return {
        eventId: futureEvent.id,
    };
}

async function createEventException(params: UpdateCalendarEvent, user: User): Promise<CalendarEventUpdateResult> {
    const { eventId, title, duration, description, date, originalDate } = params;

    const { eventDetails, creator, sequence, ...series } = await calendarMethods.updateEvent(eventId, {
        sequence: { increment: 1 },
    });

    const exclude = [
        ...series.exceptions.map((exception) => exception.originalDate),
        ...series.cancellations.map((cancelletion) => cancelletion.originalDate),
        originalDate,
    ];

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

    const rRule = RRule.fromString(series.rule);

    const icalEventDataUpdateEvent = createIcalEventData({
        id: series.id,
        users: [userOfEvent(user, creator)],
        start: rRule.options.dtstart,
        duration: eventDetails.duration,
        description: eventDetails.description,
        summary: eventDetails.title,
        rule: rRule.options.freq,
        exclude,
        sequence,
    });

    const icalEventDataException = createIcalEventData({
        id,
        users: [userOfEvent(user, creator)],
        start: date ?? originalDate,
        description: description ?? eventDetails.description,
        duration: duration ?? eventDetails.duration,
        summary: title ?? eventDetails.title,
    });

    await sendMail({
        to: user.email,
        subject: eventDetails.title,
        text: '',
        icalEvent: calendarEvents({
            method: ICalCalendarMethod.REQUEST,
            events: [icalEventDataUpdateEvent],
        }),
    });

    await sendMail({
        to: user.email,
        subject: title ?? eventDetails.title,
        text: '',
        icalEvent: calendarEvents({
            method: ICalCalendarMethod.REQUEST,
            events: [icalEventDataException],
        }),
    });

    return { eventId, exceptionId: id };
}

async function updateEventException(params: UpdateCalendarException, user: User): Promise<CalendarEventUpdateResult> {
    const { eventId, exceptionId, title, duration, description, date } = params;

    const eventException = await calendarMethods.updateEventException(exceptionId, {
        date,
        sequence: { increment: 1 },
        eventDetails: {
            update: {
                title,
                description,
                duration,
            },
        },
    });

    const { eventDetails, creator } = await calendarMethods.getEventById(eventId);

    const icalEventDataException = createIcalEventData({
        id: exceptionId,
        users: [userOfEvent(user, creator)],
        start: eventException.date,
        description: eventDetails.description,
        duration: eventDetails.duration,
        summary: eventDetails.title,
        sequence: eventException.sequence,
    });

    await sendMail({
        to: user.email,
        subject: title ?? eventDetails.title,
        text: '',
        icalEvent: calendarEvents({
            method: ICalCalendarMethod.REQUEST,
            events: [icalEventDataException],
        }),
    });

    return { eventId, exceptionId: eventException.id };
}

async function stopEventSeries(eventId: string, originalDate: Date, user: User): Promise<void> {
    const { rule } = await calendarMethods.getEventById(eventId);

    const { id, creator, exceptions, cancellations, eventDetails, sequence } = await calendarMethods.updateEvent(
        eventId,
        {
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
            sequence: { increment: 1 },
        },
    );
    const rRule = RRule.fromString(rule);

    const exclude = [
        ...exceptions.map((exception) => exception.originalDate),
        ...cancellations.map((cancelletion) => cancelletion.originalDate),
    ].filter((date) => date < originalDate);

    const icalEventDataUpdateEvent = createIcalEventData({
        id,
        users: [userOfEvent(user, creator)],
        start: rRule.options.dtstart,
        duration: eventDetails.duration,
        description: eventDetails.description,
        summary: eventDetails.title,
        rule: rRule.options.freq,
        exclude: exclude.length ? exclude : undefined,
        until: getDateBeforeDay(originalDate),
        sequence,
    });

    await sendMail({
        to: user.email,
        subject: eventDetails.title,
        text: '',
        icalEvent: calendarEvents({
            method: ICalCalendarMethod.REQUEST,
            events: [icalEventDataUpdateEvent],
        }),
    });
}

async function cancelEventException(eventId: string, exceptionId: string, user: User): Promise<void> {
    const { originalDate, sequence, ...restException } = await calendarMethods.getEventExceptionById(exceptionId);

    await calendarMethods.removeEventException(exceptionId);
    await calendarMethods.createEventCancellation({
        originalDate,
        event: {
            connect: { id: eventId },
        },
    });
    const { creator } = await calendarMethods.getEventById(eventId);

    const icalEventDataException = createIcalEventData({
        id: exceptionId,
        users: [userOfEvent(user, creator)],
        start: restException.date,
        description: restException.eventDetails.description,
        duration: restException.eventDetails.duration,
        summary: restException.eventDetails.title,
        sequence: sequence + 1,
    });

    await sendMail({
        to: user.email,
        subject: restException.eventDetails.title,
        text: '',
        icalEvent: calendarEvents({
            method: ICalCalendarMethod.CANCEL,
            events: [icalEventDataException],
        }),
    });
}

async function createEventCancellation(eventId: string, originalDate: Date, user: User): Promise<void> {
    await calendarMethods.createEventCancellation({
        originalDate,
        event: {
            connect: { id: eventId },
        },
    });
    const { exceptions, rule, creator, cancellations, eventDetails, sequence } = await calendarMethods.updateEvent(
        eventId,
        { sequence: { increment: 1 } },
    );
    const rRule = RRule.fromString(rule);

    const exclude = [
        ...exceptions.map((exception) => exception.originalDate),
        ...cancellations.map((cancelletion) => cancelletion.originalDate),
        originalDate,
    ];

    const icalEventDataUpdateEvent = createIcalEventData({
        id: eventId,
        users: [userOfEvent(user, creator)],
        start: rRule.options.dtstart,
        duration: eventDetails.duration,
        description: eventDetails.description,
        summary: eventDetails.title,
        rule: rRule.options.freq,
        exclude,
        sequence,
    });

    await sendMail({
        to: user.email,
        subject: eventDetails.title,
        text: '',
        icalEvent: calendarEvents({
            method: ICalCalendarMethod.REQUEST,
            events: [icalEventDataUpdateEvent],
        }),
    });
}

async function removeEventSeries(eventId: string, user: User): Promise<void> {
    const { rule, creator, eventDetails, sequence } = await calendarMethods.updateEvent(eventId, {
        sequence: { increment: 1 },
    });
    const rRule = RRule.fromString(rule);

    const icalEventDataSeriesRemove = createIcalEventData({
        id: eventId,
        users: [userOfEvent(user, creator)],
        start: rRule.options.dtstart,
        description: eventDetails.description,
        duration: eventDetails.duration,
        summary: eventDetails.title,
        sequence,
    });

    await sendMail({
        to: creator?.email || user.email,
        subject: eventDetails.title,
        text: '',
        icalEvent: calendarEvents({
            method: ICalCalendarMethod.CANCEL,
            events: [icalEventDataSeriesRemove],
        }),
    });
    await calendarMethods.removeEvent(eventId, user.id);
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
