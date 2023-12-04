import { trpc } from '../trpc/trpcClient';
import { useNotifications } from '../hooks/useNotifications';

import { tr } from './modules.i18n';

export const useAdminsList = () => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.roles.getAllAdmins.useQuery(undefined, { onError: enqueueErrorNotification });
};

export const useHireStreamUsers = (hireStreamId: number) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.roles.getUsersByHireStream.useQuery({ hireStreamId }, { onError: enqueueErrorNotification });
};

export const useAddHireStreamManagerToHireStreamMutation = (hireStreamName: string) => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.roles.addHireStreamManagerToHireStream.useMutation({
        onSuccess: (data, vars) => {
            enqueueSuccessNotification(
                tr('User {name} added in hire stream {hireStreamName} as manager', {
                    name: data.name || '',
                    hireStreamName,
                }),
            );
            utils.roles.getUsersByHireStream.invalidate({ hireStreamId: vars.hireStreamId });
        },
        onError: enqueueErrorNotification,
    });
};

export const useRemoveHireStreamManagerFromHireStreamMutation = (hireStreamName: string) => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.roles.removeHireStreamManagerFromHireStream.useMutation({
        onSuccess: (data, vars) => {
            enqueueSuccessNotification(
                tr('User {name} is not manager in hire srteam {hireStreamName} anymore', {
                    name: data.name || '',
                    hireStreamName,
                }),
            );
            utils.roles.getUsersByHireStream.invalidate({ hireStreamId: vars.hireStreamId });
        },
        onError: enqueueErrorNotification,
    });
};

export const useAddHiringLeadToHireStreamMutation = (hireStreamName: string) => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.roles.addHiringLeadToHireStream.useMutation({
        onSuccess: (data, vars) => {
            enqueueSuccessNotification(
                tr('User {name} added in hire stream {hireStreamName} as hire lead', {
                    name: data.name || '',
                    hireStreamName,
                }),
            );
            utils.roles.getUsersByHireStream.invalidate({ hireStreamId: vars.hireStreamId });
        },
        onError: enqueueErrorNotification,
    });
};

export const useRemoveHiringLeadFromHireStreamMutation = (hireStreamName: string) => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.roles.removeHiringLeadFromHireStream.useMutation({
        onSuccess: (data, vars) => {
            enqueueSuccessNotification(
                tr('User {name} is not hiring lead in hire srteam {hireStreamName} anymore', {
                    name: data.name || '',
                    hireStreamName,
                }),
            );
            utils.roles.getUsersByHireStream.invalidate({ hireStreamId: vars.hireStreamId });
        },
        onError: enqueueErrorNotification,
    });
};

export const useAddRecruiterToHireStreamMutation = (hireStreamName: string) => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.roles.addRecruiterToHireStream.useMutation({
        onSuccess: (data, vars) => {
            enqueueSuccessNotification(
                tr('User {name} added in hire stream {hireStreamName} as recruiter', {
                    name: data.name || '',
                    hireStreamName,
                }),
            );
            utils.roles.getUsersByHireStream.invalidate({ hireStreamId: vars.hireStreamId });
        },
        onError: enqueueErrorNotification,
    });
};

export const useRemoveRecruiterFromHireStreamMutation = (hireStreamName: string) => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.roles.removeRecruiterFromHireStream.useMutation({
        onSuccess: (data, vars) => {
            enqueueSuccessNotification(
                tr('User {name} is not recruiter in hire srteam {hireStreamName} anymore', {
                    name: data.name || '',
                    hireStreamName,
                }),
            );
            utils.roles.getUsersByHireStream.invalidate({ hireStreamId: vars.hireStreamId });
        },
        onError: enqueueErrorNotification,
    });
};

export const useAddInterviewerToSectionTypeMutation = (hireStreamName: string) => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.roles.addInterviewerToSectionType.useMutation({
        onSuccess: (data, vars) => {
            enqueueSuccessNotification(
                tr('User {name} added in hire stream {hireStreamName} as interviewer', {
                    name: data.name || '',
                    hireStreamName,
                }),
            );
            utils.roles.getUsersByHireStream.invalidate({ hireStreamId: vars.hireStreamId });
        },
        onError: enqueueErrorNotification,
    });
};

export const useRemoveInterviewerFromSectionTypeMutation = (hireStreamName: string) => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.roles.removeInterviewerFromSectionType.useMutation({
        onSuccess: (data, vars) => {
            enqueueSuccessNotification(
                tr('User {name} is not interviewer in hire srteam {hireStreamName} anymore', {
                    name: data.name || '',
                    hireStreamName,
                }),
            );
            utils.roles.getUsersByHireStream.invalidate({ hireStreamId: vars.hireStreamId });
        },
        onError: enqueueErrorNotification,
    });
};

export const useProblemEditorsList = () => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.roles.getAllproblemEditors.useQuery(undefined, { onError: enqueueErrorNotification });
};

export const useAddProblemEditorToRolesMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.roles.addProblemEditorRole.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(
                tr('User {name} added as problem editor', {
                    name: data.name || '',
                }),
            );
            utils.roles.getAllproblemEditors.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};

export const useRemoveProblemEditorToRolesMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.roles.removeProblemEditorRole.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(
                tr('User {name} is not problem editor anymore', {
                    name: data.name || '',
                }),
            );
            utils.roles.getAllproblemEditors.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};
