import { accessMiddlewares } from '../../access/access-middlewares';
import { problemDbService } from '../../modules/problem/problem-db-service';
import {
    createProblemSchema,
    deleteProblemSchema,
    getProblemByIdSchema,
    getProblemListSchema,
    updateProblemSchema,
} from '../../modules/problem/problem-types';
import { protectedProcedure, router } from '../trpc-back';

export const problemsRouter = router({
    getById: protectedProcedure
        .input(getProblemByIdSchema)
        .use(accessMiddlewares.problem.read)
        .query(({ input }) => {
            return problemDbService.getById(input.problemId);
        }),

    getList: protectedProcedure
        .input(getProblemListSchema)
        .use(accessMiddlewares.problem.read)
        .query(({ input, ctx }) => {
            return problemDbService.getList(ctx.session.user.id, input);
        }),

    getCount: protectedProcedure.input(getProblemListSchema).query(({ input, ctx }) => {
        return problemDbService.getCount(ctx.session.user.id, input);
    }),

    create: protectedProcedure
        .input(createProblemSchema)
        .use(accessMiddlewares.problem.create)
        .mutation(({ input, ctx }) => {
            return problemDbService.create(ctx.session.user.id, input);
        }),

    update: protectedProcedure
        .input(updateProblemSchema)
        .use(accessMiddlewares.problem.updateOrDelete)
        .mutation(({ input }) => {
            return problemDbService.update(input);
        }),

    delete: protectedProcedure
        .input(deleteProblemSchema)
        .use(accessMiddlewares.problem.updateOrDelete)
        .mutation(({ input }) => {
            return problemDbService.delete(input);
        }),
});
