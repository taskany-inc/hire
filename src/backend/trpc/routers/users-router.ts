import { z } from 'zod';

import { accessMiddlewares } from '../../access/access-middlewares';
import { userDbService } from '../../modules/user/user-db-service';
import {
    addProblemToFavoritesSchema,
    createUserSchema,
    editUserSettingsSchema,
    getUserListSchema,
} from '../../modules/user/user-types';
import { protectedProcedure, router } from '../trpc-back';

export const usersRouter = router({
    create: protectedProcedure
        .use(accessMiddlewares.user.create)
        .input(createUserSchema)
        .mutation(({ input }) => {
            return userDbService.create(input);
        }),

    getAll: protectedProcedure.query(() => {
        return userDbService.getAll();
    }),
    getById: protectedProcedure.input(z.number()).query(({ input }) => {
        return userDbService.find(input);
    }),
    getUserList: protectedProcedure.input(getUserListSchema).query(({ input }) => {
        return userDbService.getUserList(input);
    }),

    getFavoriteProblems: protectedProcedure.query(({ ctx }) => {
        return userDbService.getFavoriteProblems(ctx.session.user.id);
    }),

    addProblemToFavorites: protectedProcedure.input(addProblemToFavoritesSchema).mutation(({ input, ctx }) => {
        return userDbService.addProblemToFavorites(ctx.session.user.id, input);
    }),

    removeProblemFromFavorites: protectedProcedure.input(addProblemToFavoritesSchema).mutation(({ input, ctx }) => {
        return userDbService.removeProblemFromFavorites(ctx.session.user.id, input);
    }),

    getSettings: protectedProcedure.query(({ ctx }) => {
        return userDbService.getSettings(ctx.session.user.id);
    }),

    editSettings: protectedProcedure.input(editUserSettingsSchema).mutation(({ input, ctx }) => {
        return userDbService.editSettings(ctx.session.user.id, input);
    }),
});
