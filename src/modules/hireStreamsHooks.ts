import { trpc } from '../trpc/trpcClient';
import { useNotifications } from '../hooks/useNotifications';

import { tr } from './modules.i18n';

export const useHireStream = (hireStreamId: number) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.hireStreams.getById.useQuery({ hireStreamId }, { onError: enqueueErrorNotification });
};

export const useHireStreams = () => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.hireStreams.getAll.useQuery(undefined, {
        onError: enqueueErrorNotification,
    });
};

export const useAllowedHireStreams = () => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.hireStreams.getAllowed.useQuery(undefined, {
        onError: enqueueErrorNotification,
    });
};

export const useCreateHireStreamMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.hireStreams.create.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(
                tr('Hire stream {name} updated successfully', {
                    name: data.name,
                }),
            );
            utils.hireStreams.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};

export const useEditHireStreamMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.hireStreams.edit.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(tr('Hire stream {name} updated successfully', { name: data.name }));
            utils.hireStreams.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};
