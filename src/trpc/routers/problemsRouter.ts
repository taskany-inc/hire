import { accessMiddlewares } from '../../modules/accessMiddlewares';
import { problemMethods } from '../../modules/problemMethods';
import {
    createProblemSchema,
    deleteProblemSchema,
    getProblemByIdSchema,
    getProblemListSchema,
    updateProblemSchema,
} from '../../modules/problemTypes';
import { protectedProcedure, router } from '../trpcBackend';

export const problemsRouter = router({
    getById: protectedProcedure
        .input(getProblemByIdSchema)
        .use(accessMiddlewares.problem.read)
        .query(({ input }) => {
            return problemMethods.getById(input.problemId);
        }),

    getList: protectedProcedure
        .input(getProblemListSchema)
        .use(accessMiddlewares.problem.read)
        .query(({ input, ctx }) => {
            return problemMethods.getList(ctx.session.user.id, input);
        }),

    getCount: protectedProcedure.input(getProblemListSchema).query(({ input, ctx }) => {
        return problemMethods.getCount(ctx.session.user.id, input);
    }),

    create: protectedProcedure
        .input(createProblemSchema)
        .use(accessMiddlewares.problem.create)
        .mutation(({ input, ctx }) => {
            return problemMethods.create(ctx.session.user.id, input);
        }),

    update: protectedProcedure
        .input(updateProblemSchema)
        .use(accessMiddlewares.problem.updateOrDelete)
        .mutation(({ input, ctx }) => {
            return problemMethods.update(input, ctx.session.user.id);
        }),

    delete: protectedProcedure
        .input(deleteProblemSchema)
        .use(accessMiddlewares.problem.updateOrDelete)
        .mutation(({ input }) => {
            return problemMethods.delete(input);
        }),
});
