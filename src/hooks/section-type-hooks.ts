import { trpc } from '../utils/trpc-front';

import { useNotifications } from './useNotifications';

export const useSectionType = (sectionTypeId: number) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.sectionTypes.getById.useQuery({ id: sectionTypeId }, { onError: enqueueErrorNotification });
};

export const useSectionTypes = (hireStreamId: number) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.sectionTypes.getByHireStreamId.useQuery({ hireStreamId }, { onError: enqueueErrorNotification });
};

export const useSectionTypeInterviewers = (sectionTypeId: number) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.sectionTypes.getInterviewers.useQuery({ sectionTypeId }, { onError: enqueueErrorNotification });
};

export const useCreateSectionTypeMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.sectionTypes.create.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(`New section type ${data.title} created`);
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
            enqueueSuccessNotification(`Section type ${data.title} updated`);
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
            enqueueSuccessNotification(`Section type ${data.title} deleted`);
            utils.sectionTypes.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};
