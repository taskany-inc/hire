import { gradeMethods } from '../../modules/gradeMethods';
import { protectedProcedure, router } from '../trpcBackend';

export const gradesRouter = router({
    getOptions: protectedProcedure.query(() => {
        return gradeMethods.getOptions();
    }),
});
