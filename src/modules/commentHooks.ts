import { useNotifications } from '../hooks/useNotifications';
import { trpc } from '../trpc/trpcClient';

import { tr } from './modules.i18n';

export const useCommentCreateMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.comment.create.useMutation({
        onSuccess: () => {
            enqueueSuccessNotification(`${tr('New comment created')}`);
            utils.comment.invalidate();
            utils.problems.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};

export const useCommentEditMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.comment.edit.useMutation({
        onSuccess: () => {
            enqueueSuccessNotification(`${tr('Comment updated')}`);
            utils.comment.invalidate();
            utils.problems.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};

export const useCommentDeleteMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.comment.delete.useMutation({
        onSuccess: () => {
            enqueueSuccessNotification(`${tr('Comment deleted')}`);
            utils.comment.invalidate();
            utils.problems.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};
