import { accessMiddlewares } from '../../modules/accessMiddlewares';
import { tagMethods } from '../../modules/tagMethods';
import { CreateTagSchema } from '../../modules/tagTypes';
import { protectedProcedure, router } from '../trpcBackend';

export const tagsRouter = router({
    create: protectedProcedure
        .use(accessMiddlewares.tag.create)
        .input(CreateTagSchema)
        .mutation(({ input }) => {
            return tagMethods.create(input);
        }),

    getAll: protectedProcedure.use(accessMiddlewares.tag.read).query(() => {
        return tagMethods.getAll();
    }),
});
