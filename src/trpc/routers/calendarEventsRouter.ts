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
        .query(({ input, ctx }) => {
            return calendarEventMethods.getEventsForDateRange({ ...input }, ctx.session.user.id);
        }),

    create: protectedProcedure
        .input(createCalendarEventSchema)
        .use(accessMiddlewares.calendar.create)
        .mutation(({ input, ctx }) => {
            return calendarEventMethods.createEvent(input, ctx.session.user);
        }),

    update: protectedProcedure
        .input(updateCalendarEventSchema)
        .use(accessMiddlewares.calendar.updateOrDelete)
        .mutation(({ input, ctx }) => {
            const { part, exceptionId, ...restInput } = input;

            if (exceptionId) {
                return calendarEventMethods.updateEventException(
                    {
                        part: 'exception',
                        exceptionId,
                        ...restInput,
                    },
                    ctx.session.user,
                );
            }

            switch (part) {
                case 'exception':
                    return calendarEventMethods.createEventException(input, ctx.session.user);
                case 'future':
                    return calendarEventMethods.splitEventSeries(input, ctx.session.user);
                case 'series':
                    return calendarEventMethods.updateEventSeries(input, ctx.session.user);
                default:
                    assertNever(part);
            }
        }),

    remove: protectedProcedure
        .input(removeCalendarEventSchema)
        .use(accessMiddlewares.calendar.updateOrDelete)
        .mutation(({ input, ctx }) => {
            const { part, eventId, exceptionId, originalDate } = input;

            if (exceptionId) {
                return calendarEventMethods.cancelEventException(eventId, exceptionId, ctx.session.user);
            }

            switch (part) {
                case 'exception':
                    return calendarEventMethods.createEventCancellation(eventId, originalDate, ctx.session.user);
                case 'future':
                    return calendarEventMethods.stopEventSeries(eventId, originalDate, ctx.session.user);
                case 'series':
                    return calendarEventMethods.removeEventSeries(eventId, ctx.session.user);
                default:
                    assertNever(part);
            }
        }),
});
