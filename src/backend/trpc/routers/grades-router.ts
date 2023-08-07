import { gradesDbService } from '../../modules/grades/grades-db-service';
import { protectedProcedure, router } from '../trpc-back';

export const gradesRouter = router({
    getOptions: protectedProcedure.query(() => {
        return gradesDbService.getOptions();
    }),
});
