import { accessMiddlewares } from '../../modules/accessMiddlewares';
import { hireStreamMethods } from '../../modules/hireStreamMethods';
import {
    createHireStreamSchema,
    editHireStreamSchema,
    getHireStreamSuggestionsSchema,
    hireStreamNameSchema,
    hireStreamQuerySchema,
} from '../../modules/hireStreamTypes';
import { protectedProcedure, router } from '../trpcBackend';

export const hireStreamsRouter = router({
    getById: protectedProcedure
        .input(hireStreamQuerySchema)
        .use(accessMiddlewares.hireStream.readOne)
        .query(({ input }) => {
            return hireStreamMethods.getById(input.hireStreamId);
        }),

    getByName: protectedProcedure
        .input(hireStreamNameSchema)
        .use(accessMiddlewares.hireStream.readOneByName)
        .query(({ input }) => {
            return hireStreamMethods.getByName(input.hireStreamName);
        }),

    getAll: protectedProcedure.use(accessMiddlewares.hireStream.read).query(hireStreamMethods.getAll),

    getAllowed: protectedProcedure.use(accessMiddlewares.hireStream.read).query(({ ctx }) => {
        return hireStreamMethods.getAllowed(ctx.session);
    }),

    getManaged: protectedProcedure.use(accessMiddlewares.hireStream.read).query(({ ctx }) => {
        return hireStreamMethods.getManaged(ctx.session);
    }),

    create: protectedProcedure
        .input(createHireStreamSchema)
        .use(accessMiddlewares.hireStream.create)
        .mutation(({ input, ctx }) => {
            return hireStreamMethods.create(input, ctx.session.user.id);
        }),

    suggestions: protectedProcedure.input(getHireStreamSuggestionsSchema).query(({ input }) => {
        return hireStreamMethods.suggestions(input);
    }),

    edit: protectedProcedure
        .input(editHireStreamSchema)
        .use(accessMiddlewares.hireStream.update)
        .mutation(({ input }) => {
            return hireStreamMethods.edit(input);
        }),
});
