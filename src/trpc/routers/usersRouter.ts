import { z } from 'zod';

import { accessMiddlewares } from '../../modules/accessMiddlewares';
import { userMethods } from '../../modules/userMethods';
import {
    addProblemToFavoritesSchema,
    createUserSchema,
    editUserSettingsSchema,
    getUserByCrewUserSchema,
    getUserListSchema,
    getUserSuggestionsSchema,
} from '../../modules/userTypes';
import { protectedProcedure, router } from '../trpcBackend';

export const usersRouter = router({
    create: protectedProcedure
        .use(accessMiddlewares.user.create)
        .input(createUserSchema)
        .mutation(({ input }) => {
            return userMethods.create(input);
        }),

    getAll: protectedProcedure.query(() => {
        return userMethods.getAll();
    }),
    getById: protectedProcedure.input(z.number()).query(({ input }) => {
        return userMethods.find(input);
    }),
    getUserList: protectedProcedure.input(getUserListSchema).query(({ input }) => {
        return userMethods.getUserList(input);
    }),

    getFavoriteProblems: protectedProcedure.query(({ ctx }) => {
        return userMethods.getFavoriteProblems(ctx.session.user.id);
    }),

    addProblemToFavorites: protectedProcedure.input(addProblemToFavoritesSchema).mutation(({ input, ctx }) => {
        return userMethods.addProblemToFavorites(ctx.session.user.id, input);
    }),

    removeProblemFromFavorites: protectedProcedure.input(addProblemToFavoritesSchema).mutation(({ input, ctx }) => {
        return userMethods.removeProblemFromFavorites(ctx.session.user.id, input);
    }),

    getSettings: protectedProcedure.query(({ ctx }) => {
        return userMethods.getSettings(ctx.session.user.id);
    }),

    editSettings: protectedProcedure.input(editUserSettingsSchema).mutation(({ input, ctx }) => {
        return userMethods.editSettings(ctx.session.user.id, input);
    }),

    suggestions: protectedProcedure.input(getUserSuggestionsSchema).query(({ input }) => {
        return userMethods.suggestions(input);
    }),

    getByCrewUser: protectedProcedure.input(getUserByCrewUserSchema).mutation(({ input }) => {
        return userMethods.getByCrewUser(input);
    }),
});
