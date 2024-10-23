import { trpc } from '../trpc/trpcClient';
import { useNotifications } from '../hooks/useNotifications';

import { tr } from './modules.i18n';

export const useSectionType = (sectionTypeId: number) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.sectionTypes.getById.useQuery({ id: sectionTypeId }, { onError: enqueueErrorNotification });
};

export const useSectionTypes = (hireStreamId: number, options?: { enabled?: boolean }) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.sectionTypes.getByHireStreamId.useQuery(
        { hireStreamId },
        { onError: enqueueErrorNotification, ...options },
    );
};

export const useCreateSectionTypeMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.sectionTypes.create.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(tr('New section type {title} created', { title: data.title }));
            utils.sectionTypes.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};

export const useUpdateSectionTypeMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.sectionTypes.update.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(tr('Section type {title} updated', { title: data.title }));
            utils.sectionTypes.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};

export const useDeleteSectionTypeMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.sectionTypes.delete.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(tr('Section type {title} deleted', { title: data.title }));
            utils.sectionTypes.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};
