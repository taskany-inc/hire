import { CalendarData, GetCalendarEventsForRange } from '../backend/modules/calendar/calendar-types';
import { trpc } from '../utils/trpc-front';

import { useNotifications } from './useNotifications';

export const useCalendarEvents = (params: GetCalendarEventsForRange) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.calendarEvents.getEventsForDateRange.useQuery(params, { onError: enqueueErrorNotification });
};

export const useCalendarEventCreateMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.calendarEvents.create.useMutation({
        onSuccess: ({ eventId }) => {
            enqueueSuccessNotification(`Created calendar event ${eventId}`);
            utils.calendarEvents.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};

type OnMutateContext =
    | {
          previousData: CalendarData | undefined;
      }
    | undefined;

export const useCalendarEventUpdateMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.calendarEvents.update.useMutation({
        onMutate: async (data) => {
            const { creatorIds, startDate, endDate } = data;
            await utils.calendarEvents.getEventsForDateRange.cancel({ creatorIds, startDate, endDate });

            const previousData = utils.calendarEvents.getEventsForDateRange.getData({ creatorIds, startDate, endDate });
            const newData = previousData?.map((event) => {
                if (event.eventId === data.eventId) {
                    return {
                        ...event,
                        date: data.date || event.date,
                        duration: data.duration || event.duration,
                        description: data.description || event.description,
                        exceptionId: data.exceptionId || event.exceptionId,
                        title: data.title || event.title,
                    };
                }

                return event;
            });

            previousData &&
                utils.calendarEvents.getEventsForDateRange.setData({ creatorIds, startDate, endDate }, newData);

            return { previousData };
        },
        onError: (err, data, context: OnMutateContext) => {
            const { creatorIds, startDate, endDate } = data;
            context &&
                utils.calendarEvents.getEventsForDateRange.setData(
                    { creatorIds, startDate, endDate },
                    context.previousData,
                );

            return enqueueErrorNotification;
        },
        onSettled: () => {
            enqueueSuccessNotification('Calendar event updated');
            utils.calendarEvents.invalidate();
        },
    });
};

export const useCalendarRemoveEventMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.calendarEvents.remove.useMutation({
        onMutate: async (data) => {
            const { creatorIds, startDate, endDate, ...restData } = data;
            await utils.calendarEvents.getEventsForDateRange.cancel({ creatorIds, startDate, endDate });

            const previousData = utils.calendarEvents.getEventsForDateRange.getData({ creatorIds, startDate, endDate });
            const newData = previousData?.filter((event) => {
                return event.eventId !== data.eventId;
            });

            previousData &&
                utils.calendarEvents.getEventsForDateRange.setData({ creatorIds, startDate, endDate }, newData);

            return { previousData };
        },
        onError: (err, data, context: OnMutateContext) => {
            const { creatorIds, startDate, endDate } = data;
            context &&
                utils.calendarEvents.getEventsForDateRange.setData(
                    { creatorIds, startDate, endDate },
                    context.previousData,
                );

            return enqueueErrorNotification;
        },
        onSettled: () => {
            enqueueSuccessNotification('Calendar event deleted');
            utils.calendarEvents.invalidate();
        },
    });
};
