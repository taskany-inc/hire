import { z } from 'zod';
import { User } from '@prisma/client';

import { ReactionEnum } from '../utils/dictionaries';

export const upsertReactionSchema = z.object({
    userId: z.number(),
    interviewId: z.number(),
    name: z.nativeEnum(ReactionEnum).nullable(),
});

export type UpsertReaction = z.infer<typeof upsertReactionSchema>;

export type ReactionType = {
    id: number;
    name: ReactionEnum;
    count: number;
    authors: User[];
    isSelect: boolean;
};

export type ReactionWithAuthors = ReactionType & {
    authors: User[];
};

export type UpdateAuthorsType = {
    isUpdatedReaction: boolean;
    currentReaction: ReactionWithAuthors;
    updatedReaction: ReactionType;
    currentUser: User;
};
