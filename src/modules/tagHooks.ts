import { trpc } from '../trpc/trpcClient';
import { useNotifications } from '../hooks/useNotifications';

import { tr } from './modules.i18n';

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
