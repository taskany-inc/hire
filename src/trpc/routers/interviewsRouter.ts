import { InterviewStatus } from '@prisma/client';

import { accessMiddlewares } from '../../modules/accessMiddlewares';
import { analyticsEventMethods } from '../../modules/analyticsEventMethods';
import { candidateIdQuery } from '../../modules/candidateTypes';
import { hireStreamMethods } from '../../modules/hireStreamMethods';
import { interviewEventRecordingMethod } from '../../modules/interviewEventRecordingMethod';
import { InterviewEventTypes } from '../../modules/interviewEventTypes';
import { interviewMethods } from '../../modules/interviewMethods';
import {
    createInterviewSchema,
    interviewIdQuerySchema,
    updateInterviewWithMetadataSchema,
} from '../../modules/interviewTypes';
import { protectedProcedure, router } from '../trpcBackend';

export const interviewsRouter = router({
    getById: protectedProcedure
        .input(interviewIdQuerySchema)
        .use(accessMiddlewares.interview.readOne)
        .query(({ input, ctx }) => {
            return interviewMethods.getByIdWithFilteredSections(ctx.session, input.interviewId);
        }),

    getListByCandidateId: protectedProcedure
        .input(candidateIdQuery)
        .use(accessMiddlewares.interview.readMany)
        .query(({ input, ctx }) => {
            return interviewMethods.getListByCandidateId({
                candidateId: input.candidateId,
                accessOptions: ctx.accessOptions,
            });
        }),

    create: protectedProcedure
        .input(createInterviewSchema)
        .use(accessMiddlewares.interview.create)
        .mutation(async ({ input, ctx }) => {
            const hireStream = await hireStreamMethods.getById(input.hireStreamId);

            const result = await interviewMethods.create(ctx.session.user.id, input);

            await analyticsEventMethods.createEvent(
                {
                    event: 'interview_created',
                    candidateId: input.candidateId,
                    recruiterId: ctx.session.user.id,
                    hireStream: hireStream.name,
                },
                ctx.session.user.id,
            );

            interviewEventRecordingMethod.recordingCreateInterviewEvent({
                userId: ctx.session.user.id,
                interview: { ...result, sections: [] },
            });

            return result;
        }),

    update: protectedProcedure
        .input(updateInterviewWithMetadataSchema)
        .use(accessMiddlewares.interview.update)
        .mutation(async ({ input, ctx }) => {
            const previousInterview = await interviewMethods.findWithSections(input.data.interviewId);
            const hireStream = await hireStreamMethods.getById(previousInterview.hireStreamId);

            const newInterview = await interviewMethods.update(input.data);

            if (input.metadata?.createFinishInterviewEvent) {
                await analyticsEventMethods.createEvent(
                    {
                        event: 'candidate_finished_interview',
                        interviewId: input.data.interviewId,
                        candidateId: previousInterview.candidateId,
                        hireStream: hireStream.name,
                        hire: input.data.status === InterviewStatus.HIRED,
                        rejectReason: input.data.statusComment,
                    },
                    ctx.session.user.id,
                );
            }

            interviewEventRecordingMethod.recordingUpdateEvent({
                previousInterview,
                userId: ctx.session.user.id,
                eventType: InterviewEventTypes.INTERVIEW_UPDATE,
            });

            return newInterview;
        }),

    delete: protectedProcedure
        .input(interviewIdQuerySchema)
        .use(accessMiddlewares.interview.delete)
        .mutation(async ({ input, ctx }) => {
            const interviewWithSections = await interviewMethods.getById(input.interviewId);

            const result = await interviewMethods.delete(input.interviewId);

            interviewEventRecordingMethod.recordingDeleteInterviewEvent({
                userId: ctx.session.user.id,
                interview: interviewWithSections,
            });

            return result;
        }),
});
