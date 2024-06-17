import { trpc } from '../trpc/trpcClient';
import { useNotifications } from '../hooks/useNotifications';

import { GetUserList } from './userTypes';
import { tr } from './modules.i18n';

export const useUserList = (params: GetUserList) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.users.getUserList.useQuery(params, {
        onError: enqueueErrorNotification,
    });
};

export const useFavoriteProblems = () => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.users.getFavoriteProblems.useQuery(undefined, {
        onError: enqueueErrorNotification,
    });
};

export const useAddProblemToFavoritesMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.users.addProblemToFavorites.useMutation({
        onSuccess: () => {
            enqueueSuccessNotification(tr('Problem added to favorites'));
            utils.users.getFavoriteProblems.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};

export const useRemoveProblemFromFavoritesMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.users.removeProblemFromFavorites.useMutation({
        onSuccess: () => {
            enqueueSuccessNotification(tr('Problem removed from favorites'));
            utils.users.getFavoriteProblems.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};

export const useCreateUserMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.users.create.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(`${tr('New user added')} ${data.name}`);
            utils.users.getAll.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};

export const useEditUserSettings = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.users.editSettings.useMutation({
        onSuccess: () => {
            enqueueSuccessNotification(tr('Settings changed'));
            utils.users.getSettings.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};

export const useGetUserByCrewUserMutation = () => {
    const { enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.users.getByCrewUser.useMutation({
        onSuccess: () => {
            utils.users.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};
