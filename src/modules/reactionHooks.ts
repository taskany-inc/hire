import { trpc } from '../trpc/trpcClient';

import { ReactionsMap } from './reactionTypes';

const reactionsGroupsLimit = 10;

export const useReactionsResource = (reactions?: ReactionsMap) => {
    const utils = trpc.useContext();
    const toggleMutation = trpc.reaction.toggle.useMutation();
    const reactionsEmoji = Object.keys(reactions || {});
    const limited = reactionsEmoji.length >= reactionsGroupsLimit;

    const commentReaction = (commentId: string, cb?: () => void) => async (emoji?: string) => {
        if (!emoji) return;

        await toggleMutation.mutateAsync({
            emoji,
            commentId,
        });
        cb?.();
        utils.problems.invalidate();
        utils.interviews.invalidate();
        utils.comments.invalidate();
    };

    return { reactionsProps: { limited }, commentReaction };
};
