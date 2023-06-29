import { GetProblemList } from '../backend/modules/problem/problem-types';
import { trpc } from '../utils/trpc-front';

import { useNotifications } from './useNotifications';

import { tr } from './hooks.i18n';

export const useProblems = (params: GetProblemList) => {
    const { enqueueErrorNotification } = useNotifications();

    const fixedParams: GetProblemList = {
        ...params,
        authorId: params.authorId ? params.authorId : undefined,
        tagIds: params.tagIds && params.tagIds.length > 0 ? params.tagIds : undefined,
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
        authorId: params.authorId ? params.authorId : undefined,
        tagIds: params.tagIds && params.tagIds.length > 0 ? params.tagIds : undefined,
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
            enqueueSuccessNotification(tr('Problem {data.name} updated', { name: data.name }));
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
            enqueueSuccessNotification(tr('Problem {data.name} deleted', { name: data.name }));
            utils.problems.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};
