import { User } from '@prisma/client';

import { ReactionEnum } from '../../utils/dictionaries';

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
