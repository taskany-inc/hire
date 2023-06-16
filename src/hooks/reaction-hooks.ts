import { trpc } from '../utils/trpc-front';

import { useNotifications } from './useNotifications';

const getNotification = (reaction: string | null) => {
    if (!reaction) return 'Reaction deleted';

    return 'Reaction added';
};

export const useUpsertReactionMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.reactions.upsert.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(getNotification(data.name));
            utils.reactions.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};
