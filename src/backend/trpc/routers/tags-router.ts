import { accessMiddlewares } from '../../access/access-middlewares';
import { tagDbService } from '../../modules/tag/tag-db-service';
import { CreateTagSchema } from '../../modules/tag/tag-types';
import { protectedProcedure, router } from '../trpc-back';

export const tagsRouter = router({
    create: protectedProcedure
        .use(accessMiddlewares.tag.create)
        .input(CreateTagSchema)
        .mutation(({ input }) => {
            return tagDbService.create(input);
        }),

    getAll: protectedProcedure.use(accessMiddlewares.tag.read).query(() => {
        return tagDbService.getAll();
    }),
});
