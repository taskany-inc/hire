import { z } from 'zod';

import { crewMethods } from '../../modules/crewMethods';
import { getVacancyListSchema } from '../../modules/crewTypes';
import { protectedProcedure, router } from '../trpcBackend';

export const crewRouter = router({
    getVacancyById: protectedProcedure.input(z.string()).query(({ input }) => {
        return crewMethods.getVacancyById(input);
    }),

    getVacancyList: protectedProcedure.input(getVacancyListSchema).query(({ input }) => {
        return crewMethods.getVacancyList(input);
    }),
});