import { useCallback } from 'react';
import { debounce } from 'throttle-debounce';
import { useRouter } from 'next/router';
import { useUrlParams } from '@taskany/bricks';

import { GetVacancyList, VacancyStatus } from '../modules/crewTypes';

export const useVacancyFilterUrlParams = () => {
    const router = useRouter();
    const pushUrl = useCallback((url: string) => router.push(url), [router]);
    const { values, setter, clearParams } = useUrlParams(
        {
            search: 'string',
            statuses: 'stringArray',
            hireStreamIds: 'numberArray',
            hrEmails: 'stringArray',
            hiringManagerEmails: 'stringArray',
            teamIds: 'stringArray',
            closedAtStart: 'string',
            closedAtEnd: 'string',
        },
        router.query,
        pushUrl,
    );
    const setSearch = debounce(300, (s) => setter('search', s));

    return { values, setter, clearParams, setSearch };
};

export const vacancyFilterValuesToRequestData = (
    values: ReturnType<typeof useVacancyFilterUrlParams>['values'],
): GetVacancyList => {
    const data: GetVacancyList = {
        search: values.search,
        statuses: values.statuses as VacancyStatus[],
        hireStreamIds: values.hireStreamIds,
        hrEmails: values.hrEmails,
        hiringManagerEmails: values.hiringManagerEmails,
        teamIds: values.teamIds,
        take: 20,
    };

    if (values.closedAtEnd && values.closedAtStart) {
        data.closedAt = { startDate: values.closedAtStart, endDate: values.closedAtEnd };
    }

    return data;
};
