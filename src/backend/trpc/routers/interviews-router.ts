import { InterviewStatus } from '@prisma/client';

import { accessMiddlewares } from '../../access/access-middlewares';
import { analyticsEventDbService } from '../../modules/analytics-event/analytics-event-db-service';
import { candidateIdQuery } from '../../modules/candidate/candidate-types';
import { hireStreamDbService } from '../../modules/hire-streams/hire-stream-db-service';
import { interviewEventService } from '../../modules/interview-event/interview-event-service';
import { InterviewEventTypes } from '../../modules/interview-event/interview-event-types';
import { interviewDbService } from '../../modules/interview/interview-db-service';
import {
    createInterviewSchema,
    interviewIdQuerySchema,
    updateInterviewWithMetadataSchema,
} from '../../modules/interview/interview-types';
import { protectedProcedure, router } from '../trpc-back';

export const interviewsRouter = router({
    getById: protectedProcedure
        .input(interviewIdQuerySchema)
        .use(accessMiddlewares.interview.readOne)
        .query(({ input, ctx }) => {
            return interviewDbService.getByIdWithFilteredSections(ctx.session, input.interviewId);
        }),

    getListByCandidateId: protectedProcedure
        .input(candidateIdQuery)
        .use(accessMiddlewares.interview.readMany)
        .query(({ input, ctx }) => {
            return interviewDbService.getListByCandidateId({
                candidateId: input.candidateId,
                accessOptions: ctx.accessOptions,
            });
        }),

    create: protectedProcedure
        .input(createInterviewSchema)
        .use(accessMiddlewares.interview.create)
        .mutation(async ({ input, ctx }) => {
            const hireStream = await hireStreamDbService.getById(input.hireStreamId);

            const result = await interviewDbService.create(ctx.session.user.id, input);

            await analyticsEventDbService.createEvent(
                {
                    event: 'interview_created',
                    candidateId: input.candidateId,
                    recruiterId: ctx.session.user.id,
                    hireStream: hireStream.name,
                },
                ctx.session.user.id,
            );

            interviewEventService.recordingCreateInterviewEvent({
                userId: ctx.session.user.id,
                interview: { ...result, sections: [] },
            });

            return result;
        }),

    update: protectedProcedure
        .input(updateInterviewWithMetadataSchema)
        .use(accessMiddlewares.interview.update)
        .mutation(async ({ input, ctx }) => {
            const previousInterview = await interviewDbService.findWithSections(input.data.interviewId);
            const hireStream = await hireStreamDbService.getById(previousInterview.hireStreamId);

            const newInterview = await interviewDbService.update(input.data);

            if (input.metadata?.createFinishInterviewEvent) {
                await analyticsEventDbService.createEvent(
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

            interviewEventService.recordingUpdateEvent({
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
            const interviewWithSections = await interviewDbService.getById(input.interviewId);

            const result = await interviewDbService.delete(input.interviewId);

            interviewEventService.recordingDeleteInterviewEvent({
                userId: ctx.session.user.id,
                interview: interviewWithSections,
            });

            return result;
        }),
});
