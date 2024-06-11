import { accessMiddlewares } from '../../modules/accessMiddlewares';
import { solutionMethods } from '../../modules/solutionMethods';
import {
    createSolutionSchema,
    getSolutionsBySectionIdSchema,
    solutionIdQuerySchema,
    switchSolutionsOrderSchema,
    updateSolutionSchema,
} from '../../modules/solutionTypes';
import { protectedProcedure, router } from '../trpcBackend';

export const solutionsRouter = router({
    getBySectionId: protectedProcedure
        .input(getSolutionsBySectionIdSchema)
        .use(accessMiddlewares.section.readOne)
        .query(({ input }) => {
            return solutionMethods.getBySectionId(input);
        }),

    switchOrder: protectedProcedure
        .input(switchSolutionsOrderSchema)
        .use(accessMiddlewares.section.switchSolutions)
        .mutation(({ input }) => {
            return solutionMethods.switchSolutionsOrder(input);
        }),

    create: protectedProcedure
        .input(createSolutionSchema)
        .use(accessMiddlewares.section.updateNoMetadata)
        .mutation(({ input }) => {
            return solutionMethods.create(input);
        }),

    update: protectedProcedure
        .input(updateSolutionSchema)
        .use(accessMiddlewares.section.updateOrDeleteSolution)
        .mutation(({ input }) => {
            return solutionMethods.update(input);
        }),

    delete: protectedProcedure
        .input(solutionIdQuerySchema)
        .use(accessMiddlewares.section.updateOrDeleteSolution)
        .mutation(({ input }) => {
            return solutionMethods.delete(input.solutionId);
        }),
});
