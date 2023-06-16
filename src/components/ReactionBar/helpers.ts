import { User } from '@prisma/client';

import { ReactionEnum } from '../../utils/dictionaries';
import { ReactionsMatrix, ReactionWithRelations } from '../../backend/modules/interview/interview-types';
import { isSomeEnum } from '../../utils/type-guards';

import { ReactionType, ReactionWithAuthors, UpdateAuthorsType } from './types';

export const getCurrentReactions = (reactionsMatrix: ReactionsMatrix, currentUser: User): ReactionType[] =>
    Object.values(reactionsMatrix).map((reactions, index) => ({
        id: index,
        name: Object.keys(reactionsMatrix)[index] as ReactionEnum,
        count: reactions.length,
        authors: reactions.map((reaction) => reaction.user),
        isSelect: reactions.some((reaction) => reaction.user.id === currentUser.id),
    }));

export const updateCount = (
    isUpdatedReaction: boolean,
    currentReaction: ReactionWithAuthors,
    updatedReaction: ReactionType,
): number => {
    const { count } = currentReaction;

    if (currentReaction.isSelect) {
        return count - 1;
    }

    if (isUpdatedReaction) {
        return updatedReaction.count;
    }

    return count;
};

export const updateAuthors = ({
    isUpdatedReaction,
    currentReaction,
    updatedReaction,
    currentUser,
}: UpdateAuthorsType): User[] => {
    if (isUpdatedReaction) {
        if (updatedReaction.isSelect) {
            return [...currentReaction.authors, currentUser];
        }

        return currentReaction.authors.filter((author) => author.name !== currentUser?.name);
    }

    if (currentReaction.isSelect) {
        return currentReaction.authors.filter((author) => author.name !== currentUser?.name);
    }

    return currentReaction.authors;
};

type MargeSavedArgs = {
    currentUser: User;
    reactions?: ReactionWithRelations[];
};

export const mergeSavedValue = ({ currentUser, reactions }: MargeSavedArgs): ReactionType[] => {
    if (!reactions) {
        return [];
    }
    const reactionsTable: ReactionsMatrix = {
        [ReactionEnum.GOOD]: [],
        [ReactionEnum.OK]: [],
        [ReactionEnum.UNKNOWN]: [],
        [ReactionEnum.BAD]: [],
    };

    reactions.forEach((reaction) => {
        if (isSomeEnum(ReactionEnum, reaction.name)) {
            reactionsTable[reaction.name].push(reaction);
        }
    });

    return getCurrentReactions(reactionsTable, currentUser);
};
