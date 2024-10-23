import { useCallback, useEffect, useMemo } from 'react';
import { InterviewStatus } from '@prisma/client';
import { debounce } from 'throttle-debounce';
import { useRouter } from 'next/router';
import { deleteCookie, setCookie, useUrlParams } from '@taskany/bricks';

import { trpc } from '../trpc/trpcClient';
import { filtersNoSearchPresetCookie } from '../utils/filters';
import { GetCandidateList } from '../modules/candidateTypes';
import { useFiltersContext } from '../contexts/filtersContext';

export const useCandidateFilterUrlParams = () => {
    const { defaultFilterFallback } = useFiltersContext();

    const router = useRouter();
    const pushUrl = useCallback(
        (url: string) => {
            const query = url.split('?')[1];

            if (!query) {
                setCookie(filtersNoSearchPresetCookie, true, {
                    'max-age': 30,
                });
            }

            router.push(url);
        },
        [router],
    );

    const { data = [] } = trpc.filter.getDefaultFilter.useQuery(
        {
            entity: 'Candidate',
        },
        {
            enabled: defaultFilterFallback,
        },
    );

    const preset = defaultFilterFallback ? data[0] : null;

    useEffect(() => {
        if (!defaultFilterFallback) {
            deleteCookie(filtersNoSearchPresetCookie);
        }
    }, [defaultFilterFallback]);

    const query = useMemo(
        () => (preset ? Object.fromEntries(new URLSearchParams(preset.params)) : router.query),
        [preset, router.query],
    );

    const { values, setter, clearParams } = useUrlParams(
        {
            search: 'string',
            statuses: 'stringArray',
            hrIds: 'numberArray',
            hireStreamIds: 'numberArray',
            sectionTypeIds: 'numberArray',
            vacancyIds: 'stringArray',
            createdAt: 'stringArray',
        },
        query,
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
    sectionTypeIds: values.sectionTypeIds && values.sectionTypeIds.length > 0 ? values.sectionTypeIds : undefined,
    vacancyIds: values.vacancyIds && values.vacancyIds.length > 0 ? values.vacancyIds : undefined,
    createdAt: values.createdAt && values.createdAt.length > 0 ? values.createdAt : undefined,
    limit: 20,
});
