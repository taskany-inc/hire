import { useNotifications } from '../hooks/useNotifications';
import { trpc } from '../trpc/trpcClient';

import { tr } from './modules.i18n';

export const useCommentCreateMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.comment.create.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(`${tr('New comment created')}`);
            utils.comment.invalidate();

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

    return trpc.comment.edit.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(`${tr('Comment updated')}`);
            utils.comment.invalidate();

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

    return trpc.comment.delete.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(`${tr('Comment deleted')}`);
            utils.comment.invalidate();
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
