import { GetCandidateList } from '../backend/modules/candidate/candidate-types';
import { trpc } from '../utils/trpc-front';

import { useNotifications } from './useNotifications';

export const useCandidate = (candidateId: number) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.candidates.getById.useQuery({ candidateId }, { onError: enqueueErrorNotification });
};

export const useCandidates = (params: GetCandidateList) => {
    const { enqueueErrorNotification } = useNotifications();
    const preparedParams: GetCandidateList = {
        ...params,
        hireStreamIds: params.hireStreamIds && params.hireStreamIds.length > 0 ? params.hireStreamIds : undefined,
        statuses: params.statuses && params.statuses.length > 0 ? params.statuses : undefined,
    };

    return trpc.candidates.getList.useInfiniteQuery(preparedParams, {
        onError: enqueueErrorNotification,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });
};

export const useOutstaffVendors = () => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.candidates.getOutstaffVendors.useQuery(undefined, { onError: enqueueErrorNotification });
};

export const useCandidateCreateMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.candidates.create.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(`New candidate added ${data.name}`);
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
            enqueueSuccessNotification(`Candidate updated ${data.name}`);
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
            enqueueSuccessNotification(`Candidate removed ${data.id}`);
            utils.candidates.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};
