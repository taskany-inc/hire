import { trpc } from '../utils/trpc-front';

import { useNotifications } from './useNotifications';

export const useUserList = () => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.users.getAll.useQuery(undefined, { onError: enqueueErrorNotification });
};

export const useFavoriteProblems = () => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.users.getFavoriteProblems.useQuery(undefined, { onError: enqueueErrorNotification });
};

export const useAddProblemToFavoritesMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.users.addProblemToFavorites.useMutation({
        onSuccess: () => {
            enqueueSuccessNotification('Problem added to favorites');
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
            enqueueSuccessNotification('Problem removed from favorites');
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
            enqueueSuccessNotification(`New user added ${data.name}`);
            utils.users.getAll.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};
