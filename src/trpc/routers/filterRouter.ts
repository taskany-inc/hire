import { filterMethods } from '../../modules/filterMethods';
import { getDefaultFilterSchema } from '../../modules/filterTypes';
import { protectedProcedure, router } from '../trpcBackend';

export const filterRouter = router({
    getDefaultFilter: protectedProcedure.input(getDefaultFilterSchema).query(({ input }) => {
        return filterMethods.getDefaultFilters(input);
    }),
});
