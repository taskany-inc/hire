import { accessMiddlewares } from '../../access/access-middlewares';
import { reactionDbService } from '../../modules/reaction/reaction-db-service';
import { upsertReactionSchema } from '../../modules/reaction/reaction-types';
import { protectedProcedure, router } from '../trpc-back';

export const reactionsRouter = router({
    upsert: protectedProcedure
        .input(upsertReactionSchema)
        .use(accessMiddlewares.reaction.createOrReadOrUpdateOrDelete)
        .mutation(({ input }) => {
            return reactionDbService.upsert(input);
        }),
});
