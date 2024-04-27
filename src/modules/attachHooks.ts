import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { Attach } from '@prisma/client';

import { useNotifications } from '../hooks/useNotifications';
import { trpc } from '../trpc/trpcClient';

import { attachModule } from './attachModule';
import { tr } from './modules.i18n';

export const useUploadNotifications = () => {
    const utils = trpc.useContext();
    const { enqueueSuccessNotification, enqueueValidErrorNotification } = useNotifications();
    const onUploadSuccess = () => {
        enqueueSuccessNotification(tr('Added documents'));
        utils.sections.invalidate();
        utils.interviews.invalidate();
        utils.comments.invalidate();
    };
    const onUploadFail = (message = tr('Failed to upload documents')) => {
        enqueueValidErrorNotification(message);
    };
    return { onUploadSuccess, onUploadFail };
};

export const useAttachRemoveMutation = (): UseMutationResult<Attach, unknown, string> => {
    const utils = trpc.useContext();
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();

    return useMutation((vars: string) => attachModule.remove(vars), {
        onSuccess: () => {
            enqueueSuccessNotification(tr('Deleted document'));
            utils.sections.invalidate();
            utils.interviews.invalidate();
            utils.comments.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};
