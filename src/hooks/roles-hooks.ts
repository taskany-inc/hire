import { trpc } from '../utils/trpc-front';

import { useNotifications } from './useNotifications';

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
            enqueueSuccessNotification(`User ${data.name} added in hire stream ${hireStreamName} as manager`);
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
            enqueueSuccessNotification(`User ${data.name} is not manager in hire srteam ${hireStreamName} anymore`);
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
            enqueueSuccessNotification(`User ${data.name} added in hire stream ${hireStreamName} as hire lead`);
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
            enqueueSuccessNotification(`User ${data.name} is not hiring lead in hire srteam ${hireStreamName} anymore`);
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
            enqueueSuccessNotification(`User ${data.name} added in hire stream ${hireStreamName} as recruiter`);
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
            enqueueSuccessNotification(`User ${data.name} is not recruiter in hire srteam ${hireStreamName} anymore`);
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
            enqueueSuccessNotification(`User ${data.name} added in hire stream ${hireStreamName} as interviewer`);
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
            enqueueSuccessNotification(`User ${data.name} is not interviewer in hire srteam ${hireStreamName} anymore`);
            utils.roles.getUsersByHireStream.invalidate({ hireStreamId: vars.hireStreamId });
        },
        onError: enqueueErrorNotification,
    });
};
