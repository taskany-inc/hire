import { z } from 'zod';

import { ReactionEnum } from '../../../utils/dictionaries';

export const upsertReactionSchema = z.object({
    userId: z.number(),
    interviewId: z.number(),
    name: z.nativeEnum(ReactionEnum).nullable(),
});
export type UpsertReaction = z.infer<typeof upsertReactionSchema>;
