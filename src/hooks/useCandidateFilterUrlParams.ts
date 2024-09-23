import { useCallback } from 'react';
import { InterviewStatus } from '@prisma/client';
import { debounce } from 'throttle-debounce';
import { useRouter } from 'next/router';
import { useUrlParams } from '@taskany/bricks';

import { GetCandidateList } from '../modules/candidateTypes';

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
            createdAt: 'stringArray',
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
    hireStreamIds: values.hireStreamIds && values.hireStreamIds.length > 0 ? values.hireStreamIds : undefined,
    statuses: (values.statuses && values.statuses.length > 0 ? values.statuses : undefined) as InterviewStatus[],
    hrIds: values.hrIds && values.hrIds.length > 0 ? values.hrIds : undefined,
    vacancyIds: values.vacancyIds && values.vacancyIds.length > 0 ? values.vacancyIds : undefined,
    createdAt: values.createdAt && values.createdAt.length > 0 ? values.createdAt : undefined,
    limit: 20,
});
