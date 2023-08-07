import { trpc } from '../utils/trpc-front';

import { useNotifications } from './useNotifications';
import { tr } from './hooks.i18n';

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
