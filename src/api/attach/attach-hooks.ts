import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { Attach } from '@prisma/client';

import { useNotifications } from '../../hooks/useNotifications';
import { trpc } from '../../utils/trpc-front';

import { attachApiService } from './attach-api-service';

export const useOnUploadSuccess = (sectionId: number) => {
    const utils = trpc.useContext();
    const { enqueueSuccessNotification } = useNotifications();
    const onSuccess = () => {
        enqueueSuccessNotification(`Added documents to the section ${sectionId}`);
        utils.sections.invalidate();
    };
    return { onSuccess };
};

export const useOnUploadFail = () => {
    const { enqueueValidErrorNotification } = useNotifications();

    const onFail = (message = 'Failed to load') => {
        enqueueValidErrorNotification(message);
    };
    return { onFail };
};

export const useAttachRemoveMutation = (): UseMutationResult<Attach, unknown, string> => {
    const utils = trpc.useContext();
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();

    return useMutation((vars: string) => attachApiService.remove(vars), {
        onSuccess: (data) => {
            enqueueSuccessNotification(`Deleted document ${data.filename}`);
            utils.sections.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};
