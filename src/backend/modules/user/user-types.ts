import { z } from 'zod';

import { Theme, themes } from '../../../utils/theme';

export const createUserSchema = z.object({
    name: z.string().min(4),
    email: z.string().email(),
});
export type CreateUser = z.infer<typeof createUserSchema>;

export const addProblemToFavoritesSchema = z.object({
    problemId: z.number(),
});
export type AddProblemToFavorites = z.infer<typeof addProblemToFavoritesSchema>;

export const roleSchema = z.enum([
    'managerInHireStreams',
    'hiringLeadInHireStreams',
    'recruiterInHireStreams',
    'interviewerInSectionTypes',
]);
export type Role = z.infer<typeof roleSchema>;

export const getUserListSchema = z.object({
    search: z.string().optional(),
    sectionTypeId: z.number().optional(),
    limit: z.number().optional(),
    role: roleSchema.optional(),
    sectionTypeOrHireStreamId: z.number().optional(),
});

export type GetUserList = z.infer<typeof getUserListSchema>;

export const editUserSettingsSchema = z.object({
    theme: z.enum(themes).optional(),
});

export type EditUserSettings = z.infer<typeof editUserSettingsSchema>;

export interface UserSettings {
    userId: string;
    theme: Theme;
}
