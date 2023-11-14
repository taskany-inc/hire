import { accessMiddlewares } from '../../modules/accessMiddlewares';
import { analyticsEventMethods } from '../../modules/analyticsEventMethods';
import { hireStreamMethods } from '../../modules/hireStreamMethods';
import { interviewEventRecordingMethod } from '../../modules/interviewEventRecordingMethod';
import { InterviewEventTypes } from '../../modules/interviewEventTypes';
import { interviewMethods } from '../../modules/interviewMethods';
import { sectionTypeMethods } from '../../modules/sectionTypeMethods';
import { sectionMethods } from '../../modules/sectionMethods';
import {
    cancelSectionSchema,
    createSectionSchema,
    deleteSectionSchema,
    getInterviewSectionsSchema,
    getSectionSchema,
    updateSectionWithMetadataSchema,
} from '../../modules/sectionTypes';
import { protectedProcedure, router } from '../trpcBackend';

export const sectionsRouter = router({
    getInterviewSections: protectedProcedure
        .input(getInterviewSectionsSchema)
        .use(accessMiddlewares.section.readMany)
        .query(({ input }) => {
            return sectionMethods.getInterviewSections(input);
        }),

    getById: protectedProcedure
        .input(getSectionSchema)
        .use(accessMiddlewares.section.readOne)
        .query(({ input, ctx }) => {
            return sectionMethods.getById(input.sectionId, ctx.accessOptions);
        }),

    create: protectedProcedure
        .input(createSectionSchema)
        .use(accessMiddlewares.section.create)
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session.user.id;
            const previousInterview = await interviewMethods.findWithSections(input.interviewId);
            const result = await sectionMethods.create(input);
            interviewEventRecordingMethod.recordingCreateSectionEvent({ userId, previousInterview });

            return result;
        }),

    update: protectedProcedure
        .input(updateSectionWithMetadataSchema)
        .use(accessMiddlewares.section.update)
        .mutation(async ({ input, ctx }) => {
            const { data, metadata } = input;

            const sectionBeforeUpdate = await sectionMethods.getById(data.sectionId);
            const createFinishSectionEvent = sectionBeforeUpdate.hire === null && data.hire !== null;

            const result = await sectionMethods.update(data);

            const previousInterview = await interviewMethods.findWithSections(data.interviewId);

            if (createFinishSectionEvent) {
                const sectionType = await sectionTypeMethods.getById({ id: result.sectionTypeId });
                const hireStream = await hireStreamMethods.getById(previousInterview.hireStreamId);
                await analyticsEventMethods.createEvent(
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

            interviewEventRecordingMethod.recordingUpdateEvent({
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
            const result = await sectionMethods.cancel(input);

            const previousInterview = await interviewMethods.findWithSections(input.interviewId);
            interviewEventRecordingMethod.recordingUpdateEvent({
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
            const result = await sectionMethods.delete(input);

            const previousInterview = await interviewMethods.findWithSections(input.interviewId);
            interviewEventRecordingMethod.recordingUpdateEvent({
                userId: ctx.session.user.id,
                previousInterview,
                eventType: InterviewEventTypes.SECTION_REMOVE,
            });

            return result;
        }),
});
