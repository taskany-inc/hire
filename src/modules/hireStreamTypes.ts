import { z } from 'zod';

import { tr } from './modules.i18n';

export const hireStreamQuerySchema = z.object({
    hireStreamId: z.number(),
});
export type HireStreamQuery = z.infer<typeof hireStreamQuerySchema>;

export const hireStreamNameSchema = z.object({
    hireStreamName: z.string(),
});
export type HireStreamName = z.infer<typeof hireStreamNameSchema>;

export const createHireStreamSchema = z.object({
    name: z
        .string()
        .min(3, 'Minimum 3 characters')
        .regex(/^[a-z_]+$/, 'Valid characters: a-z, _'),
});
export type CreateHireStream = z.infer<typeof createHireStreamSchema>;

export const getHireStreamSuggestionsSchema = z.object({
    query: z.string(),
    take: z.number().optional(),
    include: z.array(z.number()).optional(),
});

export type GetHireStreamSuggestions = z.infer<typeof getHireStreamSuggestionsSchema>;

export const editHireStreamSchema = z.object({
    id: z.number(),
    name: z
        .string()
        .min(3, tr('Minimum length is {length}', { length: 3 }))
        .optional(),
    weekLimit: z
        .number()
        .min(1, tr('Minimum value is {value}', { value: 1 }))
        .nullish(),
    dayLimit: z
        .number()
        .min(1, tr('Minimum value is {value}', { value: 1 }))
        .nullish(),
});
export type EditHireStream = z.infer<typeof editHireStreamSchema>;
