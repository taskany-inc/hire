import {
    CalendarEvent,
    CalendarEventCancellation,
    CalendarEventDetails,
    CalendarEventException,
    User,
} from '@prisma/client';
import { z } from 'zod';

import { SectionWithInterviewRelation } from '../interview/interview-types';

export const eventRepeatModeSchema = z.enum(['never', 'daily', 'weekly', 'monthly']);
export type EventRepeatMode = z.infer<typeof eventRepeatModeSchema>;

const eventRecurrenceSchema = z.object({
    repeat: eventRepeatModeSchema,
    until: z.date().optional(),
});
export type EventRecurrence = z.infer<typeof eventRecurrenceSchema>;

const calendarSerialEventPartSchema = z.enum(['exception', 'series', 'future']);
export type CalendarSerialEventPart = z.infer<typeof calendarSerialEventPartSchema>;

export const getCalendarEventsForRangeSchema = z.object({
    startDate: z.date(),
    endDate: z.date(),
    creatorIds: z.number().array().optional(),
});
export type GetCalendarEventsForRange = z.infer<typeof getCalendarEventsForRangeSchema>;

export const createCalendarEventSchema = z.object({
    title: z.string(),
    description: z.string(),
    duration: z.number(),
    date: z.date(),
    recurrence: eventRecurrenceSchema.optional(),
});
export type CreateCalendarEvent = z.infer<typeof createCalendarEventSchema>;

export const updateCalendarEventSchema = z.object({
    eventId: z.string(),
    originalDate: z.date(),
    exceptionId: z.string().optional(),
    part: calendarSerialEventPartSchema,
    title: z.string().optional(),
    description: z.string().optional(),
    duration: z.number().optional(),
    date: z.date().optional(),
    startDate: z.date(),
    endDate: z.date(),
    creatorIds: z.number().array().optional(),
});
export type UpdateCalendarEvent = z.infer<typeof updateCalendarEventSchema>;

export const updateCalendarExceptionSchema = updateCalendarEventSchema.extend({
    part: z.literal('exception'),
    exceptionId: z.string(),
});
export type UpdateCalendarException = z.infer<typeof updateCalendarExceptionSchema>;

export const updateCalendarSeriesSchema = updateCalendarEventSchema.extend({
    part: z.literal('series'),
    exceptionId: z.undefined().optional(),
});
export type UpdateCalendarSeries = z.infer<typeof updateCalendarSeriesSchema>;

export const removeCalendarEventSchema = z.object({
    part: calendarSerialEventPartSchema,
    eventId: z.string(),
    exceptionId: z.string().optional(),
    originalDate: z.date(),
    startDate: z.date(),
    endDate: z.date(),
    creatorIds: z.number().array().optional(),
});
export type RemoveCalendarEvent = z.infer<typeof removeCalendarEventSchema>;

export interface CalendarEventExceptionWithDetails extends CalendarEventException {
    eventDetails: CalendarEventDetails;
    interviewSection: SectionWithInterviewRelation | null;
}

export interface CalendarEventWithCreatorAndDetails extends CalendarEvent {
    eventDetails: CalendarEventDetails;
    creator: User | null;
}

export interface CalendarEventWithRelations extends CalendarEvent {
    eventDetails: CalendarEventDetails;
    exceptions: CalendarEventExceptionWithDetails[];
    cancellations: CalendarEventCancellation[];
    creator: User | null;
}

export interface CalendarEventUpdateResult {
    eventId: string;
    exceptionId?: string;
}

export interface CalendarEventCreateResult {
    eventId: string;
}

export interface CalendarEventInstance {
    /**
     * CalendarEvent entry ID
     * @example 'c1c6935e-31c8-4312-b772-ce91b6fd0c52'
     */
    eventId: string;

    /**
     * CalendarEventException entry ID, if this instance is exception
     * @example 'c1c6935e-31c8-4312-b772-ce91b6fd0c52'
     */
    exceptionId?: string;

    createdAt: Date;

    title: string;
    description: string;

    /**
     * Duration in minutes
     */
    duration: number;

    date: Date;

    /**
     * Repeat settings if the event is part of a series
     */
    recurrence: EventRecurrence;

    /**
     * Linked section
     */
    interviewSection: SectionWithInterviewRelation | null;

    /**
     * Interviewer who created the calendar event (series)
     */
    creator: User | null;
}

export type CalendarData = CalendarEventInstance[];
