import { trpc } from '../utils/trpc-front';

import { useNotifications } from './useNotifications';

import { tr } from './hooks.i18n';

const getNotification = (reaction: string | null) => {
    if (!reaction) return tr('Reaction deleted');

    return tr('Reaction added');
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
