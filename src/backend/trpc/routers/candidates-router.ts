import { accessMiddlewares } from '../../access/access-middlewares';
import { analyticsEventDbService } from '../../modules/analytics-event/analytics-event-db-service';
import { candidateDbService } from '../../modules/candidate/candidate-db-service';
import {
    candidateIdQuery,
    createCandidateSchema,
    getCandidateListSchema,
    updateCandidateSchema,
} from '../../modules/candidate/candidate-types';
import { protectedProcedure, router } from '../trpc-back';

export const candidatesRouter = router({
    getById: protectedProcedure
        .input(candidateIdQuery)
        .use(accessMiddlewares.candidate.readOne)
        .query(({ input }) => {
            return candidateDbService.getById(input.candidateId);
        }),

    getList: protectedProcedure
        .input(getCandidateListSchema)
        .use(accessMiddlewares.candidate.readMany)
        .query(({ input, ctx }) => {
            return candidateDbService.getList(input, ctx.accessOptions);
        }),

    getOutstaffVendors: protectedProcedure.query(() => {
        return candidateDbService.getOutstaffVendors();
    }),

    create: protectedProcedure
        .input(createCandidateSchema)
        .use(accessMiddlewares.candidate.create)
        .mutation(async ({ input, ctx }) => {
            const result = await candidateDbService.create(input);

            await analyticsEventDbService.createEvent(
                { event: 'candidate_created', candidateId: result.id },
                ctx.session.user.id,
            );

            return result;
        }),

    update: protectedProcedure
        .input(updateCandidateSchema)
        .use(accessMiddlewares.candidate.update)
        .mutation(({ input }) => {
            return candidateDbService.update(input);
        }),

    delete: protectedProcedure
        .input(candidateIdQuery)
        .use(accessMiddlewares.candidate.delete)
        .mutation(({ input }) => {
            return candidateDbService.delete(input.candidateId);
        }),
});
