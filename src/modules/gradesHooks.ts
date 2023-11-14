import { trpc } from '../trpc/trpcClient';
import { useNotifications } from '../hooks/useNotifications';

export const useGradeOptions = () => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.grades.getOptions.useQuery(undefined, {
        onError: enqueueErrorNotification,
        staleTime: Infinity,
    });
};
