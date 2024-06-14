import { InterviewStatus } from '@prisma/client';

import { accessMiddlewares } from '../../modules/accessMiddlewares';
import { analyticsEventMethods } from '../../modules/analyticsEventMethods';
import { commentMethods } from '../../modules/commentMethods';
import { createCommentSchema, deleteCommentSchema, editCommentSchema } from '../../modules/commentTypes';
import { hireStreamMethods } from '../../modules/hireStreamMethods';
import { interviewMethods } from '../../modules/interviewMethods';
import { protectedProcedure, router } from '../trpcBackend';
import { HistorySubject } from '../../modules/historyEventTypes';
import { historyEventMethods } from '../../modules/historyEventMethods';

export const commentRouter = router({
    create: protectedProcedure
        .input(createCommentSchema)
        .use(accessMiddlewares.comment.create)
        .mutation(async ({ input, ctx }) => {
            if ('interviewId' in input.target) {
                const previousInterview = await interviewMethods.findWithSections(input.target.interviewId);
                const hireStream = await hireStreamMethods.getById(previousInterview.hireStreamId);

                const updatedInterview = await interviewMethods.update({
                    status: input.target.status,
                    interviewId: input.target.interviewId,
                });

                const commonHistoryFields = {
                    userId: ctx.session.user.id,
                    subject: HistorySubject.INTERVIEW,
                    subjectId: input.target.interviewId,
                };

                if ('status' in input && previousInterview.status !== input.target.status) {
                    await historyEventMethods.create({
                        ...commonHistoryFields,
                        action: 'set_status',
                        before: previousInterview.status,
                        after: input.target.status,
                    });
                }

                if (input.target.status === 'HIRED' || 'REJECT') {
                    await analyticsEventMethods.createEvent(
                        {
                            event: 'candidate_finished_interview',
                            interviewId: updatedInterview.id,
                            candidateId: previousInterview.candidateId,
                            hireStream: hireStream.name,
                            hire: input.target.status === InterviewStatus.HIRED,
                            rejectReason: input.text,
                        },
                        ctx.session.user.id,
                    );
                }
            }

            return commentMethods.createComment(input);
        }),

    edit: protectedProcedure
        .input(editCommentSchema)
        .use(accessMiddlewares.comment.updateOrDelete)
        .mutation(({ input }) => {
            return commentMethods.updateComment(input);
        }),

    delete: protectedProcedure
        .input(deleteCommentSchema)
        .use(accessMiddlewares.comment.updateOrDelete)
        .mutation(({ input }) => {
            return commentMethods.deleteComment(input);
        }),
});
