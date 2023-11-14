import { accessMiddlewares } from '../../modules/accessMiddlewares';
import { reactionMethods } from '../../modules/reactionMethods';
import { upsertReactionSchema } from '../../modules/reactionTypes';
import { protectedProcedure, router } from '../trpcBackend';

export const reactionsRouter = router({
    upsert: protectedProcedure
        .input(upsertReactionSchema)
        .use(accessMiddlewares.reaction.createOrReadOrUpdateOrDelete)
        .mutation(({ input }) => {
            return reactionMethods.upsert(input);
        }),
});
