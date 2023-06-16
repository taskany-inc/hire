import { accessMiddlewares } from '../../access/access-middlewares';
import { analyticsEventDbService } from '../../modules/analytics-event/analytics-event-db-service';
import { hireStreamDbService } from '../../modules/hire-streams/hire-stream-db-service';
import { interviewEventService } from '../../modules/interview-event/interview-event-service';
import { InterviewEventTypes } from '../../modules/interview-event/interview-event-types';
import { interviewDbService } from '../../modules/interview/interview-db-service';
import { sectionTypeDbService } from '../../modules/section-type/section-type-db-service';
import { sectionDbService } from '../../modules/section/section-db-service';
import {
    cancelSectionSchema,
    createSectionSchema,
    deleteSectionSchema,
    getInterviewSectionsSchema,
    getSectionSchema,
    updateSectionWithMetadataSchema,
} from '../../modules/section/section-types';
import { protectedProcedure, router } from '../trpc-back';

export const sectionsRouter = router({
    getInterviewSections: protectedProcedure
        .input(getInterviewSectionsSchema)
        .use(accessMiddlewares.section.readMany)
        .query(({ input }) => {
            return sectionDbService.getInterviewSections(input);
        }),

    getById: protectedProcedure
        .input(getSectionSchema)
        .use(accessMiddlewares.section.readOne)
        .query(({ input, ctx }) => {
            return sectionDbService.getById(input.sectionId, ctx.accessOptions);
        }),

    create: protectedProcedure
        .input(createSectionSchema)
        .use(accessMiddlewares.section.create)
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session.user.id;
            const previousInterview = await interviewDbService.findWithSections(input.interviewId);
            const result = await sectionDbService.create(input);
            interviewEventService.recordingCreateSectionEvent({ userId, previousInterview });

            return result;
        }),

    update: protectedProcedure
        .input(updateSectionWithMetadataSchema)
        .use(accessMiddlewares.section.update)
        .mutation(async ({ input, ctx }) => {
            const { data, metadata } = input;

            const sectionBeforeUpdate = await sectionDbService.getById(data.sectionId);
            const createFinishSectionEvent = sectionBeforeUpdate.hire === null && data.hire !== null;

            const result = await sectionDbService.update(data);

            const previousInterview = await interviewDbService.findWithSections(data.interviewId);

            if (createFinishSectionEvent) {
                const sectionType = await sectionTypeDbService.getById({ id: result.sectionTypeId });
                const hireStream = await hireStreamDbService.getById(previousInterview.hireStreamId);
                await analyticsEventDbService.createEvent(
                    {
                        event: 'candidate_finished_section',
                        candidateId: previousInterview.candidateId,
                        interviewId: data.interviewId,
                        interviewerId: result.interviewerId,
                        sectionId: result.id,
                        sectionType: sectionType.value,
                        hireStream: hireStream.name,
                        hire: data.hire ?? result.hire ?? false,
                        grade: data.grade ?? undefined,
                    },
                    ctx.session.user.id,
                );
            }

            interviewEventService.recordingUpdateEvent({
                userId: ctx.session.user.id,
                previousInterview,
                eventType: metadata?.eventsType ?? InterviewEventTypes.SECTION_UPDATE,
            });

            return result;
        }),

    cancel: protectedProcedure
        .input(cancelSectionSchema)
        .use(accessMiddlewares.section.delete)
        .mutation(async ({ input, ctx }) => {
            const result = await sectionDbService.cancel(input);

            const previousInterview = await interviewDbService.findWithSections(input.interviewId);
            interviewEventService.recordingUpdateEvent({
                userId: ctx.session.user.id,
                previousInterview,
                eventType: InterviewEventTypes.SECTION_CANCEL,
            });

            return result;
        }),

    delete: protectedProcedure
        .input(deleteSectionSchema)
        .use(accessMiddlewares.section.delete)
        .mutation(async ({ input, ctx }) => {
            const result = await sectionDbService.delete(input);

            const previousInterview = await interviewDbService.findWithSections(input.interviewId);
            interviewEventService.recordingUpdateEvent({
                userId: ctx.session.user.id,
                previousInterview,
                eventType: InterviewEventTypes.SECTION_REMOVE,
            });

            return result;
        }),
});
