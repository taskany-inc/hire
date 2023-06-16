import { trpc } from '../utils/trpc-front';

import { useNotifications } from './useNotifications';

export const useExternalUserSearch = (search: string) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.externalUsers.search.useQuery({ search }, { onError: enqueueErrorNotification });
};
