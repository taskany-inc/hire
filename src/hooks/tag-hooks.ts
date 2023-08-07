import { trpc } from '../utils/trpc-front';

import { useNotifications } from './useNotifications';
import { tr } from './hooks.i18n';

export const useTags = () => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.tags.getAll.useQuery(undefined, {
        onError: enqueueErrorNotification,
    });
};

export const useTagCreateMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.tags.create.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(`${tr('New tag created')} ${data.name}`);
            utils.tags.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};
