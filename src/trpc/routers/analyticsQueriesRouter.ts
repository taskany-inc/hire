import { accessMiddlewares } from '../../modules/accessMiddlewares';
import { analyticsQueriesMethods } from '../../modules/analyticsQueriesMethods';
import {
    hireStreamAndTimeRangeSchema,
    hireStreamsAndTimeRangeAndHasTasksSchema,
    hireStreamsAndTimeRangeSchema,
} from '../../modules/analyticsQueriesTypes';
import { protectedProcedure, router } from '../trpcBackend';

export const analyticsQueriesRouter = router({
    hiringFunnel: protectedProcedure
        .input(hireStreamsAndTimeRangeSchema)
        .use(accessMiddlewares.analytics.read)
        .query(({ input, ctx }) => {
            return analyticsQueriesMethods.hiringFunnel(input, ctx.session);
        }),

    hiringBySectionType: protectedProcedure
        .input(hireStreamAndTimeRangeSchema)
        .use(accessMiddlewares.analytics.readOne)
        .query(({ input }) => {
            return analyticsQueriesMethods.hiringBySectionType(input);
        }),

    sectionTypeToGradesByInterviewer: protectedProcedure
        .input(hireStreamAndTimeRangeSchema)
        .use(accessMiddlewares.analytics.readOne)
        .query(async ({ input }) => {
            return analyticsQueriesMethods.sectionTypeToGradesByInterviewer(input);
        }),

    finishedSectionsByInterviewer: protectedProcedure
        .input(hireStreamsAndTimeRangeAndHasTasksSchema)
        .use(accessMiddlewares.analytics.read)
        .query(({ input, ctx }) => {
            return analyticsQueriesMethods.finishedSectionsByInterviewer(input, ctx.session);
        }),

    candidatesByHireStream: protectedProcedure
        .input(hireStreamsAndTimeRangeSchema)
        .use(accessMiddlewares.analytics.read)
        .query(({ input, ctx }) => {
            return analyticsQueriesMethods.candidatesByHireStream(input, ctx.session);
        }),

    candidatesRejectReasons: protectedProcedure
        .input(hireStreamsAndTimeRangeSchema)
        .use(accessMiddlewares.analytics.read)
        .query(({ input, ctx }) => {
            return analyticsQueriesMethods.candidatesRejectReasons(input, ctx.session);
        }),
});
