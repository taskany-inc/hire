import { z } from 'zod';

import { themes } from '../utils/theme';

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
    'problemEditor',
]);
export type Role = z.infer<typeof roleSchema>;

export const getUserListSchema = z.object({
    search: z.string().optional(),
    sectionTypeId: z.number().optional(),
    limit: z.number().optional(),
    role: roleSchema.optional(),
    sectionTypeOrHireStreamId: z.number().optional(),
    interviewerInHireStreamId: z.number().optional(),
});

export type GetUserList = z.infer<typeof getUserListSchema>;

export const editUserSettingsSchema = z.object({
    theme: z.enum(themes).optional(),
    locale: z.string().optional(),
});

export type EditUserSettings = z.infer<typeof editUserSettingsSchema>;

export const getUserSuggestionsSchema = z.object({
    query: z.string(),
    take: z.number().optional(),
    include: z.array(z.number()).optional(),
    includeEmails: z.array(z.string()).optional(),
    hr: z.boolean().optional(),
});

export type GetUserSuggestions = z.infer<typeof getUserSuggestionsSchema>;

export const getUserByCrewUserSchema = z.object({
    name: z.string().nullish(),
    login: z.string().nullish(),
    email: z.string(),
});

export type GetUserByCrewUser = z.infer<typeof getUserByCrewUserSchema>;
