import { useNotifications } from '../hooks/useNotifications';
import { trpc } from '../trpc/trpcClient';

import { tr } from './modules.i18n';

export const useCommentCreateMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.comments.create.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(`${tr('New comment created')}`);
            utils.comments.invalidate();

            if (data.problemId) {
                utils.problems.invalidate();
            }

            if (data.interviewId) {
                utils.interviews.invalidate();
            }
        },
        onError: enqueueErrorNotification,
    });
};

export const useCommentEditMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.comments.edit.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(`${tr('Comment updated')}`);
            utils.comments.invalidate();

            if (data.problemId) {
                utils.problems.invalidate();
            }
            if (data.interviewId) {
                utils.interviews.invalidate();
            }
        },
        onError: enqueueErrorNotification,
    });
};

export const useCommentDeleteMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.comments.delete.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(`${tr('Comment deleted')}`);
            utils.comments.invalidate();
            if (data.problemId) {
                utils.problems.invalidate();
            }
            if (data.interviewId) {
                utils.interviews.invalidate();
            }
        },
        onError: enqueueErrorNotification,
    });
};
