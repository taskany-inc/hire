import { endOfDay } from 'date-fns';

import { assertNever } from '../../utils';
import { accessMiddlewares } from '../../modules/accessMiddlewares';
import { calendarEventMethods } from '../../modules/calendarEventMethods';
import {
    createCalendarEventSchema,
    getCalendarEventsForRangeSchema,
    removeCalendarEventSchema,
    updateCalendarEventSchema,
} from '../../modules/calendarTypes';
import { protectedProcedure, router } from '../trpcBackend';

export const calendarEventsRouter = router({
    getEventsForDateRange: protectedProcedure
        .input(getCalendarEventsForRangeSchema)
        .use(accessMiddlewares.calendar.readMany)
        .query(({ input }) => {
            return calendarEventMethods.getEventsForDateRange({
                startDate: input.startDate,
                endDate: endOfDay(input.endDate),
                creatorIds: input.creatorIds,
            });
        }),

    create: protectedProcedure
        .input(createCalendarEventSchema)
        .use(accessMiddlewares.calendar.create)
        .mutation(({ input, ctx }) => {
            return calendarEventMethods.createEvent(input, ctx.session.user.id);
        }),

    update: protectedProcedure
        .input(updateCalendarEventSchema)
        .use(accessMiddlewares.calendar.updateOrDelete)
        .mutation(({ input, ctx }) => {
            const { part, exceptionId, ...restInput } = input;

            if (exceptionId) {
                return calendarEventMethods.updateEventException({
                    part: 'exception',
                    exceptionId,
                    ...restInput,
                });
            }

            switch (part) {
                case 'exception':
                    return calendarEventMethods.createEventException(input);
                case 'future':
                    return calendarEventMethods.splitEventSeries(input, ctx.session.user.id);
                case 'series':
                    return calendarEventMethods.updateEventSeries(input);
                default:
                    assertNever(part);
            }
        }),

    remove: protectedProcedure
        .input(removeCalendarEventSchema)
        .use(accessMiddlewares.calendar.updateOrDelete)
        .mutation(({ input }) => {
            const { part, eventId, exceptionId, originalDate } = input;

            if (exceptionId) {
                return calendarEventMethods.cancelEventException(eventId, exceptionId);
            }

            switch (part) {
                case 'exception':
                    return calendarEventMethods.createEventCancellation(eventId, originalDate);
                case 'future':
                    return calendarEventMethods.stopEventSeries(eventId, originalDate);
                case 'series':
                    return calendarEventMethods.removeEventSeries(eventId);
                default:
                    assertNever(part);
            }
        }),
});
