import { trpc } from '../trpc/trpcClient';
import { useNotifications } from '../hooks/useNotifications';

import { GetInterviewSections } from './sectionTypes';
import { tr } from './modules.i18n';

export const useInterviewSections = (params: GetInterviewSections) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.sections.getInterviewSections.useQuery(params, {
        onError: enqueueErrorNotification,
    });
};

export const useSection = (sectionId: number) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.sections.getById.useQuery({ sectionId }, { onError: enqueueErrorNotification });
};

export const useSectionCreateMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.sections.create.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(`${tr('New section added')} ${data.id}`);
            utils.sections.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};

export const useSectionUpdateMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.sections.update.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(tr('Section {id} updated', { id: data.id }));
            utils.sections.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};

export const useSectionCancelMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.sections.cancel.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(tr('Section {id} deleted', { id: data.id }));
            utils.sections.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};
