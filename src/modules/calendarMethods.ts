import {
    CalendarEvent,
    CalendarEventException,
    Prisma,
    CalendarEventCancellation,
    PrismaPromise,
} from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { RRule } from 'rrule';

import { ErrorWithStatus } from '../utils';
import { prisma } from '../utils/prisma';

import {
    CalendarEventExceptionWithDetailsWOinterView,
    CalendarEventWithCreatorAndDetails,
    CalendarEventWithRelations,
} from './calendarTypes';
import { tr } from './modules.i18n';
import { calendarRecurrenceMethods } from './calendarRecurrenceMethods';

const getAllEvents = (startDate: Date, endDate: Date, creatorIds?: number[]): Promise<CalendarEventWithRelations[]> => {
    const where: Prisma.CalendarEventWhereInput = { creator: { active: true } };

    if (creatorIds) {
        where.creatorId = {
            in: creatorIds,
        };
    }

    return prisma.calendarEvent.findMany({
        include: {
            eventDetails: true,
            exceptions: {
                where: {
                    OR: [
                        { date: { gte: startDate, lte: endDate } },
                        { originalDate: { gte: startDate, lte: endDate } },
                    ],
                },
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
            exceptions: { include: { eventDetails: true } },
            cancellations: true,
        },
    });

    if (!event) {
        throw new ErrorWithStatus(tr('Calendar event with id {eventId} not found', { eventId }), 404);
    }

    return event;
};

const getEventExceptionById = async (exceptionId: string): Promise<CalendarEventExceptionWithDetailsWOinterView> => {
    const event = await prisma.calendarEventException.findUnique({
        where: { id: exceptionId },
        include: { eventDetails: true },
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

const updateEvent = (
    eventId: string,
    data: Prisma.CalendarEventUpdateInput,
): PrismaPromise<CalendarEventWithCreatorAndDetails> =>
    prisma.calendarEvent.update({
        where: { id: eventId },
        data,
        include: {
            creator: true,
            eventDetails: true,
            exceptions: { include: { eventDetails: true } },
            cancellations: true,
        },
    });

async function removeEvent(eventId: string, userId: number): Promise<void> {
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

    const transactions = [exceptionRemoval, cancellationRemoval, eventRemoval, eventDetailsRemoval];

    const exceptions = await prisma.calendarEventException.findMany({
        where: {
            eventId,
        },
        include: { eventDetails: true, event: { include: { eventDetails: true } }, interviewSection: true },
    });

    for (const exception of exceptions) {
        const rule = calendarRecurrenceMethods.buildRule({
            startDate: exception.date,
            recurrence: { repeat: 'never' },
        });

        if (!RRule.fromString(exception.event.rule).options.freq) break;

        const data: Prisma.CalendarEventCreateInput = {
            id: exception.id,
            rule,
            sequence: exception.sequence,
            creator: { connect: { id: exception.event.creatorId || userId } },
            eventDetails: {
                create: {
                    description: exception.eventDetails.description,
                    duration: exception.eventDetails.duration,
                    title: exception.eventDetails.title,
                },
            },
        };

        if (exception.interviewSection) {
            data.exceptions = {
                create: {
                    date: exception.date,
                    originalDate: exception.originalDate,
                    sequence: exception.sequence,
                    eventDetails: {
                        create: {
                            title: exception.eventDetails.title,
                            description: exception.eventDetails.description,
                            duration: exception.eventDetails.duration,
                        },
                    },
                    interviewSection: { connect: { id: exception.interviewSection.id } },
                },
            };
        }
        transactions.push(prisma.calendarEvent.create({ data }));
    }

    await prisma.$transaction(transactions);
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

const isEventExceptionAlreadyExist = async (originalDate: Date, eventId: string): Promise<string | undefined> => {
    const exeption = await prisma.calendarEventException.findFirst({
        where: { originalDate, eventId },
        include: { interviewSection: true },
    });

    if (exeption?.interviewSection) {
        throw new ErrorWithStatus(tr('Calendar exception of event on this date already occupied'), 400);
    }
    return exeption?.id;
};

export const calendarMethods = {
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
    isEventExceptionAlreadyExist,
};
