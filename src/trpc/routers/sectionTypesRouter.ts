import { accessMiddlewares } from '../../modules/accessMiddlewares';
import { sectionTypeMethods } from '../../modules/sectionTypeMethods';
import {
    createSectionTypeSchema,
    getAllSectionTypesSchema,
    getSectionTypeSchema,
    sectionTypeQuerySchema,
    updateSectionTypeSchema,
} from '../../modules/sectionTypeTypes';
import { protectedProcedure, router } from '../trpcBackend';

export const sectionTypesRouter = router({
    getById: protectedProcedure.input(getSectionTypeSchema).query(({ input }) => {
        return sectionTypeMethods.getById(input);
    }),

    getByHireStreamId: protectedProcedure
        .input(getAllSectionTypesSchema.required())
        .use(accessMiddlewares.hireStream.read)
        .query(({ input }) => {
            return sectionTypeMethods.getAll(input);
        }),

    create: protectedProcedure
        .input(createSectionTypeSchema)
        .use(accessMiddlewares.hireStream.updateBySectionTypeId)
        .mutation(({ input }) => {
            return sectionTypeMethods.create(input);
        }),

    update: protectedProcedure
        .input(updateSectionTypeSchema)
        .use(accessMiddlewares.hireStream.updateBySectionTypeId)
        .mutation(({ input }) => {
            return sectionTypeMethods.update(input);
        }),

    delete: protectedProcedure
        .input(sectionTypeQuerySchema)
        .use(accessMiddlewares.hireStream.updateBySectionTypeId)
        .mutation(({ input }) => {
            return sectionTypeMethods.delete(input.sectionTypeId);
        }),
});
