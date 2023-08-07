import { trpc } from '../utils/trpc-front';

import { useNotifications } from './useNotifications';

export const useGradeOptions = () => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.grades.getOptions.useQuery(undefined, {
        onError: enqueueErrorNotification,
        staleTime: Infinity,
    });
};
