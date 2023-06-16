import { analyticsEventQueryDbService } from '../../modules/analytics-queries/analytics-queries-db-service';
import {
    hireStreamAndTimeRangeSchema,
    hireStreamsAndTimeRangeAndHasTasksSchema,
    hireStreamsAndTimeRangeSchema,
} from '../../modules/analytics-queries/analytics-queries-types';
import { protectedProcedure, router } from '../trpc-back';

export const analyticsQueriesRouter = router({
    hiringFunnel: protectedProcedure.input(hireStreamsAndTimeRangeSchema).query(({ input }) => {
        return analyticsEventQueryDbService.hiringFunnel(input);
    }),

    hiringBySectionType: protectedProcedure.input(hireStreamAndTimeRangeSchema).query(({ input }) => {
        return analyticsEventQueryDbService.hiringBySectionType(input);
    }),

    sectionTypeToGradesByInterviewer: protectedProcedure
        .input(hireStreamAndTimeRangeSchema)
        .query(async ({ input }) => {
            return analyticsEventQueryDbService.sectionTypeToGradesByInterviewer(input);
        }),

    finishedSectionsByInterviewer: protectedProcedure
        .input(hireStreamsAndTimeRangeAndHasTasksSchema)
        .query(({ input }) => {
            return analyticsEventQueryDbService.finishedSectionsByInterviewer(input);
        }),

    candidatesByHireStream: protectedProcedure.input(hireStreamsAndTimeRangeSchema).query(({ input }) => {
        return analyticsEventQueryDbService.candidatesByHireStream(input);
    }),

    candidatesRejectReasons: protectedProcedure.input(hireStreamsAndTimeRangeSchema).query(({ input }) => {
        return analyticsEventQueryDbService.candidatesRejectReasons(input);
    }),
});
