import { useCallback } from 'react';
import { InterviewStatus } from '@prisma/client';
import { debounce } from 'throttle-debounce';
import { useRouter } from 'next/router';

import { GetCandidateList } from '../modules/candidateTypes';

import { useUrlParams } from './useUrlParams';

export const useCandidateFilterUrlParams = () => {
    const router = useRouter();
    const pushUrl = useCallback((url: string) => router.push(url), [router]);
    const { values, setter, clearParams } = useUrlParams(
        {
            search: 'string',
            statuses: 'stringArray',
            hrIds: 'numberArray',
            hireStreamIds: 'numberArray',
            vacancyIds: 'stringArray',
        },
        router.query,
        pushUrl,
    );
    const setSearch = debounce(300, (s) => setter('search', s));

    return { values, setter, clearParams, setSearch };
};

export const candidateFilterValuesToRequestData = (
    values: ReturnType<typeof useCandidateFilterUrlParams>['values'],
): GetCandidateList => ({
    search: values.search,
    statuses: values.statuses as InterviewStatus[],
    hireStreamIds: values.hireStreamIds,
    hrIds: values.hrIds,
    vacancyIds: values.vacancyIds,
    limit: 20,
});
