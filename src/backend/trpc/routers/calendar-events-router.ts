import { endOfDay } from 'date-fns';

import { assertNever } from '../../../utils';
import { accessMiddlewares } from '../../access/access-middlewares';
import { calendarEventService } from '../../modules/calendar/calendar-event-service';
import {
    createCalendarEventSchema,
    getCalendarEventsForRangeSchema,
    removeCalendarEventSchema,
    updateCalendarEventSchema,
} from '../../modules/calendar/calendar-types';
import { protectedProcedure, router } from '../trpc-back';

export const calendarEventsRouter = router({
    getEventsForDateRange: protectedProcedure
        .input(getCalendarEventsForRangeSchema)
        .use(accessMiddlewares.calendar.readMany)
        .query(({ input }) => {
            return calendarEventService.getEventsForDateRange({
                startDate: input.startDate,
                endDate: endOfDay(input.endDate),
                creatorIds: input.creatorIds,
            });
        }),

    create: protectedProcedure
        .input(createCalendarEventSchema)
        .use(accessMiddlewares.calendar.create)
        .mutation(({ input, ctx }) => {
            return calendarEventService.createEvent(input, ctx.session.user.id);
        }),

    update: protectedProcedure
        .input(updateCalendarEventSchema)
        .use(accessMiddlewares.calendar.updateOrDelete)
        .mutation(({ input, ctx }) => {
            const { part, exceptionId, ...restInput } = input;

            if (exceptionId) {
                return calendarEventService.updateEventException({
                    part: 'exception',
                    exceptionId,
                    ...restInput,
                });
            }

            switch (part) {
                case 'exception':
                    return calendarEventService.createEventException(input);
                case 'future':
                    return calendarEventService.splitEventSeries(input, ctx.session.user.id);
                case 'series':
                    return calendarEventService.updateEventSeries(input);
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
                return calendarEventService.cancelEventException(eventId, exceptionId);
            }

            switch (part) {
                case 'exception':
                    return calendarEventService.createEventCancellation(eventId, originalDate);
                case 'future':
                    return calendarEventService.stopEventSeries(eventId, originalDate);
                case 'series':
                    return calendarEventService.removeEventSeries(eventId);
                default:
                    assertNever(part);
            }
        }),
});
