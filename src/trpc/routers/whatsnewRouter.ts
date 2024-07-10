import { whatsnewMethods } from '../../modules/whatsnewMethods';
import { checkReleaseSchema, markReleaseSchema } from '../../modules/whatsnewTypes';
import { router, protectedProcedure } from '../trpcBackend';

export const whatsnewRouter = router({
    check: protectedProcedure.input(checkReleaseSchema).query(({ input, ctx }) => {
        return whatsnewMethods.check({ locale: input.locale, userId: ctx.session.user.id });
    }),

    markAsRead: protectedProcedure.input(markReleaseSchema).mutation(({ input, ctx }) => {
        return whatsnewMethods.markAsRead({
            version: input.version,
            userId: ctx.session.user.id,
        });
    }),

    markAsDelayed: protectedProcedure.input(markReleaseSchema).mutation(({ input, ctx }) => {
        return whatsnewMethods.markAsDelayed({
            version: input.version,
            userId: ctx.session.user.id,
        });
    }),
});
