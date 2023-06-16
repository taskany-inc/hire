import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { Attach } from '@prisma/client';

import { useNotifications } from '../../hooks/useNotifications';
import { trpc } from '../../utils/trpc-front';

import { attachApiService } from './attach-api-service';

type UploadFiles = {
    sectionId: number;
    formData: FormData;
};

export const useAttachesCreateMutation = (): UseMutationResult<Attach, unknown, UploadFiles> => {
    const utils = trpc.useContext();
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();

    return useMutation((vars: UploadFiles) => attachApiService.uploadFile(vars.sectionId, vars.formData), {
        onSuccess: (data, variables) => {
            enqueueSuccessNotification(`Added documents to the section ${variables.sectionId}`);
            utils.sections.invalidate();
        },
        onError: enqueueErrorNotification,
    });
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
