import { crewMethods } from '../../modules/crewMethods';
import { getVacancyListSchema } from '../../modules/crewTypes';
import { protectedProcedure, router } from '../trpcBackend';

export const crewRouter = router({
    getVacancyList: protectedProcedure.input(getVacancyListSchema).query(({ input }) => {
        return crewMethods.getVacancyList(input);
    }),
});
