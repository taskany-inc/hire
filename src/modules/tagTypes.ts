import { z } from 'zod';

import { tr } from './modules.i18n';

export const CreateTagSchema = z.object({ name: z.string().min(2, tr('Tag is too short')) });
export type CreateTag = z.infer<typeof CreateTagSchema>;

export const getTagSuggestionsSchema = z.object({
    query: z.string(),
    take: z.number().optional(),
    include: z.array(z.number()).optional(),
});

export type GetTagSuggestions = z.infer<typeof getTagSuggestionsSchema>;
