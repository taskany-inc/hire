import { z } from 'zod';

import { restProcedure, router } from '../trpcBackend';
import { hireStreamMethods } from '../../modules/hireStreamMethods';

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
});
