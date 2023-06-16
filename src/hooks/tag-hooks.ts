import { trpc } from '../utils/trpc-front';

import { useNotifications } from './useNotifications';

export const useTags = () => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.tags.getAll.useQuery(undefined, { onError: enqueueErrorNotification });
};

export const useTagCreateMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.tags.create.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(`New tag created ${data.name}`);
            utils.tags.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};
