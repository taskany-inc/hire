import {
    HireStreamAndTimeRange,
    HireStreamsAndTimeRange,
    hireStreamsAndTimeRangeAndHasTasks,
} from '../backend/modules/analytics-queries/analytics-queries-types';
import { trpc } from '../utils/trpc-front';

import { useNotifications } from './useNotifications';

export const useHiringFunnel = (input: HireStreamsAndTimeRange) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.analyticsQueries.hiringFunnel.useQuery(input, { onError: enqueueErrorNotification });
};

export const useHiringBySectionType = (input: HireStreamAndTimeRange) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.analyticsQueries.hiringBySectionType.useQuery(input, { onError: enqueueErrorNotification });
};

export const useSectionTypeToGradesByInterviewer = (input: HireStreamAndTimeRange) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.analyticsQueries.sectionTypeToGradesByInterviewer.useQuery(input, {
        onError: enqueueErrorNotification,
    });
};

export const useFinishedSectionsByInterviewer = (input: hireStreamsAndTimeRangeAndHasTasks) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.analyticsQueries.finishedSectionsByInterviewer.useQuery(input, { onError: enqueueErrorNotification });
};

export const useCandidatesByHireStream = (input: HireStreamsAndTimeRange) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.analyticsQueries.candidatesByHireStream.useQuery(input, { onError: enqueueErrorNotification });
};

export const useCandidatesRejectReasons = (input: HireStreamsAndTimeRange) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.analyticsQueries.candidatesRejectReasons.useQuery(input, { onError: enqueueErrorNotification });
};
