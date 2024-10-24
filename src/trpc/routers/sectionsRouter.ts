import { accessMiddlewares } from '../../modules/accessMiddlewares';
import { analyticsEventMethods } from '../../modules/analyticsEventMethods';
import { hireStreamMethods } from '../../modules/hireStreamMethods';
import { interviewMethods } from '../../modules/interviewMethods';
import { sectionTypeMethods } from '../../modules/sectionTypeMethods';
import { sectionMethods } from '../../modules/sectionMethods';
import {
    cancelSectionSchema,
    createSectionSchema,
    deleteSectionSchema,
    getSectionSchema,
    updateSectionWithMetadataSchema,
} from '../../modules/sectionTypes';
import { protectedProcedure, router } from '../trpcBackend';
import { historyEventMethods } from '../../modules/historyEventMethods';
import { HistorySubject } from '../../modules/historyEventTypes';
import { prisma } from '../../utils/prisma';
import { notifyHR } from '../../modules/emailMethods';
import config from '../../config';
import { userMethods } from '../../modules/userMethods';
import { crewMethods } from '../../modules/crewMethods';
import { idObjsToIds } from '../../utils';

const hireStatusToString = (hire: boolean | null | undefined) => {
    if (hire === undefined || hire === null) return;
    return hire ? 'HIRE' : 'NO_HIRE';
};

const giveSectionAchievement = async (interviewerId: number) => {
    if (!config.crew.techUserEmail) return;

    const amountOfInterviewerCompletedSections = await prisma.section.count({
        where: {
            interviewers: { some: { id: interviewerId } },
            feedback: { not: null },
            sectionType: { giveAchievement: true },
        },
    });

    const { email } = await userMethods.find(interviewerId);

    const achievementResult = await crewMethods.giveAchievement({
        targetUserEmail: email,
        actingUserEmail: config.crew.techUserEmail,
        sectionsNumber: amountOfInterviewerCompletedSections,
    });

    console.log(`Crew achievement response: ${achievementResult}`);
};

export const sectionsRouter = router({
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
            const section = await sectionMethods.create(input, ctx.session.user);

            const sectionType = await prisma.sectionType.findFirstOrThrow({ where: { id: input.sectionTypeId } });
            await historyEventMethods.create({
                userId: ctx.session.user.id,
                subject: HistorySubject.INTERVIEW,
                subjectId: input.interviewId,
                action: 'add_section',
                after: `${sectionType.title}.${section.id}`,
            });

            return section;
        }),

    update: protectedProcedure
        .input(updateSectionWithMetadataSchema)
        .use(accessMiddlewares.section.update)
        .mutation(async ({ input, ctx }) => {
            const { data } = input;

            const sectionBeforeUpdate = await sectionMethods.getById(data.sectionId);
            const createFinishSectionEvent = sectionBeforeUpdate.hire === null && data.hire !== null;

            const result = await sectionMethods.update(data, ctx.session.user);

            const previousInterview = await interviewMethods.findWithSections(data.interviewId);

            if (createFinishSectionEvent) {
                const sectionType = await sectionTypeMethods.getById({ id: result.sectionTypeId });
                const hireStream = await hireStreamMethods.getById(previousInterview.hireStreamId);
                await analyticsEventMethods.createEvent(
                    {
                        event: 'candidate_finished_section',
                        candidateId: previousInterview.candidateId,
                        interviewId: data.interviewId,
                        interviewerIds: idObjsToIds(result.interviewers),
                        sectionId: result.id,
                        sectionType: sectionType.value,
                        hireStream: hireStream.name,
                        hire: data.hire ?? result.hire ?? false,
                        grade: data.grade ?? undefined,
                    },
                    ctx.session.user.id,
                );

                await notifyHR(result.id, data);
                if (sectionType.giveAchievement) {
                    await Promise.all(result.interviewers.map(({ id }) => giveSectionAchievement(id)));
                }
            }

            const commonHistoryFields = {
                userId: ctx.session.user.id,
                subject: HistorySubject.SECTION,
                subjectId: data.sectionId,
            };

            if ('hire' in data && sectionBeforeUpdate.hire !== data.hire) {
                await historyEventMethods.create({
                    ...commonHistoryFields,
                    action: 'set_hire',
                    before: hireStatusToString(sectionBeforeUpdate.hire),
                    after: hireStatusToString(data.hire),
                });
            }

            if ('grade' in data && sectionBeforeUpdate.grade !== data.grade) {
                await historyEventMethods.create({
                    ...commonHistoryFields,
                    action: 'set_grade',
                    before: sectionBeforeUpdate.grade ?? undefined,
                    after: data.grade ?? undefined,
                });
            }

            if ('feedback' in data && sectionBeforeUpdate.feedback !== data.feedback) {
                await historyEventMethods.create({
                    ...commonHistoryFields,
                    action: 'set_feedback',
                    before: sectionBeforeUpdate.feedback ?? undefined,
                    after: data.feedback ?? undefined,
                });
            }

            return result;
        }),

    cancel: protectedProcedure
        .input(cancelSectionSchema)
        .use(accessMiddlewares.section.delete)
        .mutation(async ({ input, ctx }) => {
            const result = await sectionMethods.cancel(input);

            await historyEventMethods.create({
                userId: ctx.session.user.id,
                subject: HistorySubject.SECTION,
                subjectId: input.sectionId,
                action: 'cancel',
            });

            return result;
        }),

    delete: protectedProcedure
        .input(deleteSectionSchema)
        .use(accessMiddlewares.section.delete)
        .mutation(async ({ input }) => {
            return sectionMethods.delete(input);
        }),
});
