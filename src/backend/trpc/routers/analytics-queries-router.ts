import { accessMiddlewares } from '../../access/access-middlewares';
import { analyticsEventQueryDbService } from '../../modules/analytics-queries/analytics-queries-db-service';
import {
    hireStreamAndTimeRangeSchema,
    hireStreamsAndTimeRangeAndHasTasksSchema,
    hireStreamsAndTimeRangeSchema,
} from '../../modules/analytics-queries/analytics-queries-types';
import { protectedProcedure, router } from '../trpc-back';

export const analyticsQueriesRouter = router({
    hiringFunnel: protectedProcedure
        .input(hireStreamsAndTimeRangeSchema)
        .use(accessMiddlewares.analytics.read)
        .query(({ input, ctx }) => {
            return analyticsEventQueryDbService.hiringFunnel(input, ctx.session);
        }),

    hiringBySectionType: protectedProcedure
        .input(hireStreamAndTimeRangeSchema)
        .use(accessMiddlewares.analytics.readOne)
        .query(({ input }) => {
            return analyticsEventQueryDbService.hiringBySectionType(input);
        }),

    sectionTypeToGradesByInterviewer: protectedProcedure
        .input(hireStreamAndTimeRangeSchema)
        .use(accessMiddlewares.analytics.readOne)
        .query(async ({ input }) => {
            return analyticsEventQueryDbService.sectionTypeToGradesByInterviewer(input);
        }),

    finishedSectionsByInterviewer: protectedProcedure
        .input(hireStreamsAndTimeRangeAndHasTasksSchema)
        .use(accessMiddlewares.analytics.read)
        .query(({ input, ctx }) => {
            return analyticsEventQueryDbService.finishedSectionsByInterviewer(input, ctx.session);
        }),

    candidatesByHireStream: protectedProcedure
        .input(hireStreamsAndTimeRangeSchema)
        .use(accessMiddlewares.analytics.read)
        .query(({ input, ctx }) => {
            return analyticsEventQueryDbService.candidatesByHireStream(input, ctx.session);
        }),

    candidatesRejectReasons: protectedProcedure
        .input(hireStreamsAndTimeRangeSchema)
        .use(accessMiddlewares.analytics.read)
        .query(({ input, ctx }) => {
            return analyticsEventQueryDbService.candidatesRejectReasons(input, ctx.session);
        }),
});
