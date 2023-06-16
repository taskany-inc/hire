import { trpc } from '../utils/trpc-front';

import { useNotifications } from './useNotifications';

export const useHireStream = (hireStreamId: number) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.hireStreams.getById.useQuery({ hireStreamId }, { onError: enqueueErrorNotification });
};

export const useHireStreams = () => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.hireStreams.getAll.useQuery(undefined, { onError: enqueueErrorNotification });
};

export const useAllowedHireStreams = () => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.hireStreams.getAllowed.useQuery(undefined, { onError: enqueueErrorNotification });
};

export const useCreateHireStreamMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.hireStreams.create.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(`Hire stream ${data.name} updated successfully`);
            utils.hireStreams.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};
