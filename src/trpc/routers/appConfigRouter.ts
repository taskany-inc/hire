import { z } from 'zod';

import { publicProcedure, protectedProcedure, router } from '../trpcBackend';
import { appConfigMethods } from '../../modules/appConfigMethods';
import { accessMiddlewares } from '../../modules/accessMiddlewares';

export const appConfigRouter = router({
    get: publicProcedure.query(() => {
        return appConfigMethods.get();
    }),

    setAiAssistant: protectedProcedure
        .input(z.string().nullable())
        .use(accessMiddlewares.aiAssistant.update)
        .mutation(async ({ input }) => {
            return appConfigMethods.setAiAssistant(input);
        }),
});
