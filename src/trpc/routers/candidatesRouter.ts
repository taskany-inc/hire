import { accessMiddlewares } from '../../modules/accessMiddlewares';
import { analyticsEventMethods } from '../../modules/analyticsEventMethods';
import { candidateMethods } from '../../modules/candidateMethods';
import {
    candidateIdQuery,
    createCandidateSchema,
    getCandidateCountSchema,
    getCandidateListSchema,
    updateCandidateSchema,
} from '../../modules/candidateTypes';
import { protectedProcedure, router } from '../trpcBackend';

export const candidatesRouter = router({
    getById: protectedProcedure
        .input(candidateIdQuery)
        .use(accessMiddlewares.candidate.readOne)
        .query(({ input }) => {
            return candidateMethods.getById(input.candidateId);
        }),

    getCount: protectedProcedure
        .input(getCandidateCountSchema)
        .use(accessMiddlewares.candidate.readMany)
        .query(({ input }) => {
            return candidateMethods.getCount(input);
        }),

    getList: protectedProcedure
        .input(getCandidateListSchema)
        .use(accessMiddlewares.candidate.readMany)
        .query(({ input, ctx }) => {
            return candidateMethods.getList(input, ctx.accessOptions);
        }),

    getOutstaffVendors: protectedProcedure.query(() => {
        return candidateMethods.getOutstaffVendors();
    }),

    create: protectedProcedure
        .input(createCandidateSchema)
        .use(accessMiddlewares.candidate.create)
        .mutation(async ({ input, ctx }) => {
            const result = await candidateMethods.create(input);

            await analyticsEventMethods.createEvent(
                { event: 'candidate_created', candidateId: result.id },
                ctx.session.user.id,
            );

            return result;
        }),

    update: protectedProcedure
        .input(updateCandidateSchema)
        .use(accessMiddlewares.candidate.update)
        .mutation(({ input }) => {
            return candidateMethods.update(input);
        }),

    delete: protectedProcedure
        .input(candidateIdQuery)
        .use(accessMiddlewares.candidate.delete)
        .mutation(({ input }) => {
            return candidateMethods.delete(input.candidateId);
        }),
});
