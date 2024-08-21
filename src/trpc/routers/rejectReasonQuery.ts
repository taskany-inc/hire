import { z } from 'zod';

import { protectedProcedure, router } from '../trpcBackend';
import { accessMiddlewares } from '../../modules/accessMiddlewares';
import { rejectReasonMethods } from '../../modules/rejectReasonMethods';

export const rejectReasonRouter = router({
    findAll: protectedProcedure
        .input(z.object({ data: z.object({ iterviewId: z.number() }) }))
        .use(accessMiddlewares.interview.update)
        .query(() => rejectReasonMethods.findAll()),
});
