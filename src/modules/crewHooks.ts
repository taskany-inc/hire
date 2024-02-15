import { useNotifications } from '../hooks/useNotifications';
import { trpc } from '../trpc/trpcClient';

import { GetVacancyList } from './crewTypes';

export const useVacancies = (params: Omit<GetVacancyList, 'skip'>) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.crew.getVacancyList.useInfiniteQuery(params, {
        onError: enqueueErrorNotification,
        getNextPageParam: (lastPage, allPages) => {
            const fetchedCount = allPages.reduce((prev, next) => prev + next.vacancies.length, 0);
            return fetchedCount < lastPage.count ? fetchedCount : null;
        },
    });
};
