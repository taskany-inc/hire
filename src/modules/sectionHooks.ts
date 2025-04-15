import { trpc } from '../trpc/trpcClient';
import { useNotifications } from '../hooks/useNotifications';

import { tr } from './modules.i18n';

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
            utils.calendarEvents.invalidate();
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
            utils.calendarEvents.invalidate();
            utils.historyEvents.getHistoryEvents.invalidate();
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
            utils.calendarEvents.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};

export const useSectionCodeSessionCreate = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.sections.createCodeSession.useMutation({
        onSuccess: () => {
            enqueueSuccessNotification(tr('Code session successfully create'));
            utils.sections.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};
