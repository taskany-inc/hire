import { trpc } from '../trpc/trpcClient';
import { useNotifications } from '../hooks/useNotifications';

import { GetCandidateList } from './candidateTypes';
import { tr } from './modules.i18n';

export const useCandidate = (candidateId: number) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.candidates.getById.useQuery({ candidateId }, { onError: enqueueErrorNotification });
};

export const useCandidates = (params: GetCandidateList) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.candidates.getList.useInfiniteQuery(params, {
        keepPreviousData: true,
        onError: enqueueErrorNotification,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });
};

export const useOutstaffVendors = () => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.candidates.getOutstaffVendors.useQuery(undefined, {
        onError: enqueueErrorNotification,
    });
};

export const useCandidateCreateMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.candidates.create.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(`${tr('New candidate added')} ${data.name}`);
            utils.candidates.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};

export const useCandidateUpdateMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.candidates.update.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(`${tr('Candidate updated')} ${data.name}`);
            utils.candidates.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};

export const useCandidateDeleteMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.candidates.delete.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(`${tr('Candidate removed')} ${data.id}`);
            utils.candidates.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};
