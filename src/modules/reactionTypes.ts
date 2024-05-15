import { z } from 'zod';

export const toggleReactionSchema = z.object({
    emoji: z.string(),
    commentId: z.string().optional(),
});
export type ToggleReaction = z.infer<typeof toggleReactionSchema>;

export interface ReactionsMap {
    [key: string]: {
        count: number;
        remains: number;
        authors: {
            userId: number;
            name?: string | null;
        }[];
    };
}
