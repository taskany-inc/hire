import { trpc } from '../trpc/trpcClient';
import { useNotifications } from '../hooks/useNotifications';

import { GetProblemList } from './problemTypes';
import { tr } from './modules.i18n';

export const useProblems = (params: GetProblemList) => {
    const { enqueueErrorNotification } = useNotifications();

    const fixedParams: GetProblemList = {
        ...params,
        authorIds: params.authorIds && params.authorIds.length > 0 ? params.authorIds : undefined,
        tagIds: params.tagIds && params.tagIds.length > 0 ? params.tagIds : undefined,
        difficulty: params.difficulty && params.difficulty.length > 0 ? params.difficulty : undefined,
    };

    return trpc.problems.getList.useInfiniteQuery(fixedParams, {
        onError: enqueueErrorNotification,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });
};

export const useProblemCount = (params: GetProblemList) => {
    const { enqueueErrorNotification } = useNotifications();

    const fixedParams: GetProblemList = {
        ...params,
        authorIds: params.authorIds && params.authorIds.length > 0 ? params.authorIds : undefined,
        tagIds: params.tagIds && params.tagIds.length > 0 ? params.tagIds : undefined,
        difficulty: params.difficulty && params.difficulty.length > 0 ? params.difficulty : undefined,
    };

    return trpc.problems.getCount.useQuery(fixedParams, {
        onError: enqueueErrorNotification,
    });
};

export const useProblem = (problemId: number) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.problems.getById.useQuery({ problemId }, { onError: enqueueErrorNotification });
};

export const useProblemCreateMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.problems.create.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(`${tr('New problem created')} ${data.name}`);
            utils.problems.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};

export const useProblemUpdateMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.problems.update.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(tr('Problem {name} updated', { name: data.name }));
            utils.problems.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};

export const useProblemRemoveMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.problems.delete.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(tr('Problem {name} deleted', { name: data.name }));
            utils.problems.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};
