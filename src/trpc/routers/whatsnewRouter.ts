import { whatsnewMethods } from '../../modules/whatsnewMethods';
import { checkReleaseSchema, markReleaseSchema } from '../../modules/whatsnewTypes';
import { router, protectedProcedure } from '../trpcBackend';

export const whatsnewRouter = router({
    check: protectedProcedure.input(checkReleaseSchema).query(({ input, ctx }) => {
        return whatsnewMethods.check({ locale: input.locale, userSettingId: ctx.session.user.settings?.id });
    }),

    markAsRead: protectedProcedure.input(markReleaseSchema).mutation(({ input, ctx }) => {
        return whatsnewMethods.markAsRead({
            version: input.version,
            userSettingId: ctx.session.user.settings?.id,
        });
    }),

    markAsDelayed: protectedProcedure.input(markReleaseSchema).mutation(({ input, ctx }) => {
        return whatsnewMethods.markAsDelayed({
            version: input.version,
            userSettingId: ctx.session.user.settings?.id,
        });
    }),
});
