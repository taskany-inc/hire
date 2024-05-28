import { InterviewStatus } from '@prisma/client';

import { accessMiddlewares } from '../../modules/accessMiddlewares';
import { analyticsEventMethods } from '../../modules/analyticsEventMethods';
import { candidateIdQuery } from '../../modules/candidateTypes';
import { hireStreamMethods } from '../../modules/hireStreamMethods';
import { interviewMethods } from '../../modules/interviewMethods';
import {
    createInterviewSchema,
    editInterviewAccessListSchema,
    interviewIdQuerySchema,
    updateInterviewWithMetadataSchema,
} from '../../modules/interviewTypes';
import { protectedProcedure, router } from '../trpcBackend';
import { historyEventMethods } from '../../modules/historyEventMethods';
import { HistorySubject } from '../../modules/historyEventTypes';
import { prisma } from '../../utils/prisma';

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

            const commonHistoryFields = {
                userId: ctx.session.user.id,
                subject: HistorySubject.INTERVIEW,
                subjectId: input.data.interviewId,
            };

            if (
                'candidateSelectedSectionId' in input.data &&
                previousInterview.candidateSelectedSectionId !== input.data.candidateSelectedSectionId
            ) {
                await historyEventMethods.create({
                    ...commonHistoryFields,
                    action: 'set_candidate_selected_section',
                    before: previousInterview.candidateSelectedSectionId
                        ? String(previousInterview.candidateSelectedSectionId)
                        : undefined,
                    after: input.data.candidateSelectedSectionId
                        ? String(input.data.candidateSelectedSectionId)
                        : undefined,
                });
            }

            if ('status' in input.data && previousInterview.status !== input.data.status) {
                await historyEventMethods.create({
                    ...commonHistoryFields,
                    action: 'set_status',
                    before: previousInterview.status,
                    after: input.data.status,
                });
            }

            return newInterview;
        }),

    delete: protectedProcedure
        .input(interviewIdQuerySchema)
        .use(accessMiddlewares.interview.delete)
        .mutation(async ({ input }) => {
            return interviewMethods.delete(input.interviewId);
        }),

    editAccessList: protectedProcedure
        .input(editInterviewAccessListSchema)
        .use(accessMiddlewares.interview.editAccessList)
        .mutation(async ({ input, ctx }) => {
            const user = await prisma.user.findFirstOrThrow({ where: { id: input.userId }, select: { name: true } });

            const editedInterview = await interviewMethods.editAccessList(input);

            const commonHistoryFields = {
                userId: ctx.session.user.id,
                subject: HistorySubject.INTERVIEW,
                subjectId: input.interviewId,
            };

            if (input.type === 'RESTRICT' && input.action === 'ADD') {
                await historyEventMethods.create({
                    ...commonHistoryFields,
                    action: 'add_restricted_user',
                    after: `${input.userId}.${user.name}`,
                });
            }

            if (input.type === 'RESTRICT' && input.action === 'DELETE') {
                await historyEventMethods.create({
                    ...commonHistoryFields,
                    action: 'remove_restricted_user',
                    after: `${input.userId}.${user.name}`,
                });
            }

            if (input.type === 'ALLOW' && input.action === 'ADD') {
                await historyEventMethods.create({
                    ...commonHistoryFields,
                    action: 'add_allowed_user',
                    after: `${input.userId}.${user.name}`,
                });
            }

            if (input.type === 'ALLOW' && input.action === 'DELETE') {
                await historyEventMethods.create({
                    ...commonHistoryFields,
                    action: 'remove_allowed_user',
                    after: `${input.userId}.${user.name}`,
                });
            }

            return editedInterview;
        }),
});
