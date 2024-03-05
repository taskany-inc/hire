import { publicProcedure, router } from '../trpcBackend';
import { appConfigMethods } from '../../modules/appConfigMethods';

export const appConfigRouter = router({
    get: publicProcedure.query(() => {
        return appConfigMethods.get();
    }),
});
