import { trpc } from '../trpc/trpcClient';
import { useNotifications } from '../hooks/useNotifications';

export const useExternalUserSearch = (search: string) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.externalUsers.search.useQuery({ search }, { onError: enqueueErrorNotification });
};
