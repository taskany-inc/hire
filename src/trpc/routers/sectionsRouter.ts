import { accessMiddlewares } from '../../modules/accessMiddlewares';
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

const hireStatusToString = (hire: boolean | null | undefined) => {
    if (hire === undefined || hire === null) return;
    return hire ? 'HIRE' : 'NO_HIRE';
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

            const result = await sectionMethods.update(data, ctx.session.user);

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

    createCodeSession: protectedProcedure
        .input(getSectionSchema)
        .use(accessMiddlewares.section.updateNoMetadata)
        .mutation(async ({ input }) => sectionMethods.createAndLinkCodeSession(input.sectionId)),
});
