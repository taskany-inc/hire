import { z } from 'zod';

import { crewMethods } from '../../modules/crewMethods';
import { getGroupListSchema, getVacancyListSchema } from '../../modules/crewTypes';
import { protectedProcedure, router } from '../trpcBackend';

export const crewRouter = router({
    getVacancyById: protectedProcedure.input(z.string()).query(({ input }) => {
        return crewMethods.getVacancyById(input);
    }),

    getVacancyList: protectedProcedure.input(getVacancyListSchema).query(({ input }) => {
        return crewMethods.getVacancyList(input);
    }),

    getGroupList: protectedProcedure.input(getGroupListSchema).query(({ input }) => {
        return crewMethods.getGroupList(input);
    }),

    searchUsers: protectedProcedure.input(z.string()).query(({ input }) => {
        return crewMethods.searchUsers(input);
    }),
});
