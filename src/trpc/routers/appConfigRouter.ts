import { protectedProcedure, router } from '../trpcBackend';
import { appConfigMethods } from '../../modules/appConfigMethods';

export const appConfigRouter = router({
    get: protectedProcedure.query(() => {
        return appConfigMethods.get();
    }),
});
