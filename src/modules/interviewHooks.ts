import { trpc } from '../trpc/trpcClient';
import { useNotifications } from '../hooks/useNotifications';

import { tr } from './modules.i18n';

export const useInterview = (interviewId: number) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.interviews.getById.useQuery({ interviewId }, { onError: enqueueErrorNotification });
};

export const useCandidateInterviews = (candidateId: number) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.interviews.getListByCandidateId.useQuery({ candidateId }, { onError: enqueueErrorNotification });
};

export const useInterviewCreateMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.interviews.create.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(`${tr('New interview created')} ${data.id}`);
            utils.interviews.invalidate();
            utils.candidates.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};

export const useInterviewUpdateMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.interviews.update.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(`${tr('Interview updated')} ${data.id}`);
            utils.interviews.invalidate();
            utils.candidates.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};

export const useInterviewRemoveMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.interviews.delete.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(`${tr('Interview deleted')} ${data.id}`);
            utils.interviews.invalidate();
            utils.candidates.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};

export const useEditInterviewAccessList = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.interviews.editAccessList.useMutation({
        onSuccess: (_data, input) => {
            const message =
                input.action === 'ADD'
                    ? tr('User added to the restriction list')
                    : tr('User removed from the restriction list');
            enqueueSuccessNotification(message);
            utils.interviews.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};
