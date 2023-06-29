import {
    CalendarEvent,
    CalendarEventException,
    Prisma,
    CalendarEventCancellation,
    PrismaPromise,
} from '@prisma/client';
import { TRPCError } from '@trpc/server';

import { ErrorWithStatus } from '../../../utils';
import { prisma } from '../../index';

import { CalendarEventWithCreatorAndDetails, CalendarEventWithRelations } from './calendar-types';

import { tr } from './calendar.i18n';

const getAllEvents = (creatorIds?: number[]): Promise<CalendarEventWithRelations[]> => {
    const where: Prisma.CalendarEventWhereInput = {};

    if (creatorIds) {
        where.creatorId = {
            in: creatorIds,
        };
    }

    return prisma.calendarEvent.findMany({
        include: {
            eventDetails: true,
            exceptions: {
                include: {
                    eventDetails: true,
                    interviewSection: {
                        include: {
                            interview: {
                                include: {
                                    candidate: true,
                                },
                            },
                            sectionType: true,
                        },
                    },
                },
            },
            cancellations: true,
            creator: true,
        },
        where,
    });
};

const getEventById = async (eventId: string): Promise<CalendarEventWithCreatorAndDetails> => {
    const event = await prisma.calendarEvent.findUnique({
        where: { id: eventId },
        include: {
            eventDetails: true,
            creator: true,
        },
    });

    if (!event) {
        throw new ErrorWithStatus(tr('Calendar event with id {eventId} not found', { eventId }), 404);
    }

    return event;
};

const getEventExceptionById = async (exceptionId: string): Promise<CalendarEventException> => {
    const event = await prisma.calendarEventException.findUnique({
        where: { id: exceptionId },
    });

    if (!event) {
        throw new ErrorWithStatus(tr('Calendar event exception with id {exceptionId} not found', { exceptionId }), 404);
    }

    return event;
};
const findEventExceptionIds = async (where: Prisma.CalendarEventExceptionWhereInput): Promise<string[]> => {
    const exceptions = await prisma.calendarEventException.findMany({
        select: { id: true },
        where,
    });

    return exceptions.map(({ id }) => id);
};

const findEventCancellationIds = async (where: Prisma.CalendarEventCancellationWhereInput): Promise<string[]> => {
    const cancellations = await prisma.calendarEventCancellation.findMany({
        select: { id: true },
        where,
    });

    return cancellations.map(({ id }) => id);
};

const createEvent = (data: Prisma.CalendarEventCreateInput): Promise<CalendarEvent> =>
    prisma.calendarEvent.create({
        data,
    });

const updateEvent = (eventId: string, data: Prisma.CalendarEventUpdateInput): PrismaPromise<CalendarEvent> =>
    prisma.calendarEvent.update({
        where: { id: eventId },
        data,
    });

async function removeEvent(eventId: string): Promise<void> {
    const eventDetailsRemoval = prisma.calendarEventDetails.deleteMany({
        where: {
            OR: [
                {
                    event: {
                        id: eventId,
                    },
                },
                {
                    eventException: {
                        eventId,
                    },
                },
            ],
        },
    });

    const exceptionRemoval = prisma.calendarEventException.deleteMany({
        where: {
            eventId,
        },
    });

    const cancellationRemoval = prisma.calendarEventCancellation.deleteMany({
        where: {
            eventId,
        },
    });

    const eventRemoval = prisma.calendarEvent.delete({
        where: { id: eventId },
    });

    await prisma.$transaction([exceptionRemoval, cancellationRemoval, eventRemoval, eventDetailsRemoval]);
}

const updateEventException = (
    exceptionId: string,
    data: Prisma.CalendarEventExceptionUpdateInput,
): Promise<CalendarEventException> =>
    prisma.calendarEventException.update({
        where: { id: exceptionId },
        data,
    });

const updateEventExceptions = (
    where: Prisma.CalendarEventExceptionWhereInput,
    data: Prisma.CalendarEventExceptionUncheckedUpdateManyInput,
): PrismaPromise<Prisma.BatchPayload> =>
    prisma.calendarEventException.updateMany({
        where,
        data,
    });

const updateEventCancellations = (
    where: Prisma.CalendarEventCancellationWhereInput,
    data: Prisma.CalendarEventCancellationUncheckedUpdateManyInput,
): PrismaPromise<Prisma.BatchPayload> =>
    prisma.calendarEventCancellation.updateMany({
        where,
        data,
    });

const shiftEventExceptionOriginalDates = (eventId: string, addMinutes: number): PrismaPromise<number> => {
    if (typeof addMinutes !== 'number') {
        // Preventing the very unexpected SQL-injection
        throw new TRPCError({ code: 'BAD_REQUEST', message: tr('addMinutes must be a number') });
    }

    return prisma.$executeRawUnsafe(
        // The addMinutes parameter cannot be passed to the parameterized SQL query $executeRaw
        // (including in the format `+ ${addMinutes} * '1 minute'`)
        // - it seems that in this case the parameter is somehow wrapped incorrectly;
        // in any case, the field value does not change, although the record is considered updated.
        `
            update "CalendarEventException"
            set "originalDate" = "originalDate" + interval '${addMinutes} minutes'
            where "eventId" = $1
        `,
        eventId,
    );
};

const shiftEventCancellationOriginalDates = (eventId: string, addMinutes: number): PrismaPromise<number> => {
    if (typeof addMinutes !== 'number') {
        // Preventing the very unexpected SQL-injection
        throw new TRPCError({ code: 'BAD_REQUEST', message: tr('addMinutes must be a number') });
    }

    return prisma.$executeRawUnsafe(
        // The addMinutes parameter cannot be passed to the parameterized SQL query $executeRaw
        // (including in the format `+ ${addMinutes} * '1 minute'`)
        // - it seems that in this case the parameter is somehow wrapped incorrectly;
        // in any case, the field value does not change, although the record is considered updated.
        `
            update "CalendarEventCancellation"
            set "originalDate" = "originalDate" + interval '${addMinutes} minutes'
            where "eventId" = $1
        `,
        eventId,
    );
};

const createEventException = (data: Prisma.CalendarEventExceptionCreateInput): Promise<CalendarEventException> =>
    prisma.calendarEventException.create({
        data,
    });

async function removeEventException(exceptionId: string): Promise<void> {
    await prisma.calendarEventException.delete({
        where: { id: exceptionId },
    });
}

const createEventCancellation = (
    data: Prisma.CalendarEventCancellationCreateInput,
): Promise<CalendarEventCancellation> =>
    prisma.calendarEventCancellation.create({
        data,
    });

const isEventExceptionUnique = async (originalDate: Date, eventId: string): Promise<void> => {
    const exeption = await prisma.calendarEventException.findFirst({
        where: { originalDate, eventId },
    });

    if (exeption) throw new ErrorWithStatus(tr('Calendar exception of event on this date already exist'), 400);
};

export const calendarDbService = {
    getAllEvents,
    getEventById,
    getEventExceptionById,
    findEventExceptionIds,
    findEventCancellationIds,
    createEvent,
    updateEvent,
    removeEvent,
    createEventException,
    updateEventException,
    updateEventExceptions,
    updateEventCancellations,
    shiftEventExceptionOriginalDates,
    shiftEventCancellationOriginalDates,
    removeEventException,
    createEventCancellation,
    isEventExceptionUnique,
};
