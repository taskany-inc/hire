import { trpc } from '../trpc/trpcClient';
import { useNotifications } from '../hooks/useNotifications';

import { tr } from './modules.i18n';

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
