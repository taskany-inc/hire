import { z } from 'zod';

export const createUserSchema = z.object({
    name: z.string().min(4),
    email: z.string().email(),
});
export type CreateUser = z.infer<typeof createUserSchema>;

export const addProblemToFavoritesSchema = z.object({
    problemId: z.number(),
});
export type AddProblemToFavorites = z.infer<typeof addProblemToFavoritesSchema>;

export const getUserListSchema = z.object({
    search: z.string().optional(),
    sectionTypeId: z.number().optional(),
    limit: z.number().optional(),
});

export type GetUserList = z.infer<typeof getUserListSchema>;
