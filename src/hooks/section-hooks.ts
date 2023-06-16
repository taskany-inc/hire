import { GetInterviewSections } from '../backend/modules/section/section-types';
import { trpc } from '../utils/trpc-front';

import { useNotifications } from './useNotifications';

export const useInterviewSections = (params: GetInterviewSections) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.sections.getInterviewSections.useQuery(params, { onError: enqueueErrorNotification });
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
            enqueueSuccessNotification(`New section added ${data.id}`);
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
            enqueueSuccessNotification(`Section ${data.id} updated`);
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
            enqueueSuccessNotification(`Section ${data.id} deleted`);
            utils.sections.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};
