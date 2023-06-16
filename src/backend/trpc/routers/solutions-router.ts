import { accessMiddlewares } from '../../access/access-middlewares';
import { solutionDbService } from '../../modules/solution/solution-db-service';
import {
    createSolutionSchema,
    getSolutionsBySectionIdSchema,
    solutionIdQuerySchema,
    switchSolutionsOrderSchema,
    updateSolutionSchema,
} from '../../modules/solution/solution-types';
import { protectedProcedure, router } from '../trpc-back';

export const solutionsRouter = router({
    getBySectionId: protectedProcedure
        .input(getSolutionsBySectionIdSchema)
        .use(accessMiddlewares.solution.readBySectionId)
        .query(({ input }) => {
            return solutionDbService.getBySectionId(input);
        }),

    switchOrder: protectedProcedure
        .input(switchSolutionsOrderSchema)
        .use(accessMiddlewares.solution.updateOrDeleteBySectionId)
        .mutation(({ input }) => {
            return solutionDbService.switchSolutionsOrder(input);
        }),

    create: protectedProcedure
        .input(createSolutionSchema)
        .use(accessMiddlewares.solution.create)
        .mutation(({ input }) => {
            return solutionDbService.create(input);
        }),

    update: protectedProcedure
        .input(updateSolutionSchema)
        .use(accessMiddlewares.solution.updateOrDelete)
        .mutation(({ input }) => {
            return solutionDbService.update(input);
        }),

    delete: protectedProcedure
        .input(solutionIdQuerySchema)
        .use(accessMiddlewares.solution.updateOrDelete)
        .mutation(({ input }) => {
            return solutionDbService.delete(input.solutionId);
        }),
});
