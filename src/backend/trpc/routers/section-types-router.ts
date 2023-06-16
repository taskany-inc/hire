import { accessMiddlewares } from '../../access/access-middlewares';
import { sectionTypeDbService } from '../../modules/section-type/section-type-db-service';
import {
    createSectionTypeSchema,
    getAllSectionTypesSchema,
    getSectionTypeSchema,
    sectionTypeQuerySchema,
    updateSectionTypeSchema,
} from '../../modules/section-type/section-type-types';
import { protectedProcedure, router } from '../trpc-back';

export const sectionTypesRouter = router({
    getById: protectedProcedure.input(getSectionTypeSchema).query(({ input }) => {
        return sectionTypeDbService.getById(input);
    }),

    getByHireStreamId: protectedProcedure
        .input(getAllSectionTypesSchema.required())
        .use(accessMiddlewares.hireStream.read)
        .query(({ input }) => {
            return sectionTypeDbService.getAll(input);
        }),

    getInterviewers: protectedProcedure.input(sectionTypeQuerySchema).query(({ input }) => {
        return sectionTypeDbService.getInterviewers(input.sectionTypeId);
    }),

    create: protectedProcedure
        .input(createSectionTypeSchema)
        .use(accessMiddlewares.hireStream.updateBySectionTypeId)
        .mutation(({ input }) => {
            return sectionTypeDbService.create(input);
        }),

    update: protectedProcedure
        .input(updateSectionTypeSchema)
        .use(accessMiddlewares.hireStream.updateBySectionTypeId)
        .mutation(({ input }) => {
            return sectionTypeDbService.update(input);
        }),

    delete: protectedProcedure
        .input(sectionTypeQuerySchema)
        .use(accessMiddlewares.hireStream.updateBySectionTypeId)
        .mutation(({ input }) => {
            return sectionTypeDbService.delete(input.sectionTypeId);
        }),
});
