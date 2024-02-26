import { z } from 'zod';

import { restProcedure, router } from '../trpcBackend';
import { hireStreamMethods } from '../../modules/hireStreamMethods';
import { rolesMethods } from '../../modules/rolesMethods';
import { getHireStreamRecruitersSchema } from '../../modules/rolesTypes';

export const restRouter = router({
    getAllHireStreams: restProcedure
        .meta({
            openapi: {
                method: 'GET',
                path: '/hire-streams',
            },
        })
        .input(z.void())
        .output(
            z.array(
                z.object({
                    id: z.number(),
                    name: z.string(),
                }),
            ),
        )
        .query(() => {
            return hireStreamMethods.getAll();
        }),

    getHireStreamRecruiters: restProcedure
        .meta({
            openapi: {
                method: 'GET',
                path: '/hire-streams/{id}/recruiters',
            },
        })
        .input(getHireStreamRecruitersSchema)
        .output(
            z.array(
                z.object({
                    id: z.number(),
                    name: z.string().nullable(),
                    email: z.string(),
                }),
            ),
        )
        .query(({ input }) => {
            return rolesMethods.getHireStreamRecruiters(input);
        }),
});
