import { historyEventMethods } from '../../modules/historyEventMethods';
import { GetHistoryEventsSchema } from '../../modules/historyEventTypes';
import { protectedProcedure, router } from '../trpcBackend';

export const historyEventsRouter = router({
    getHistoryEvents: protectedProcedure.input(GetHistoryEventsSchema).query(({ input }) => {
        return historyEventMethods.getHistoryEvents(input);
    }),
});
