import { TRPCError } from '@trpc/server';

import config from '../config';

import { Vacancy, GetVacancyList } from './crewTypes';

const checkConfig = () => {
    if (!config.crew.url || !config.crew.apiToken) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Crew integration is not configured' });
    }
    return { url: config.crew.url, apiToken: config.crew.apiToken };
};

export const crewMethods = {
    getVacancyList: async ({ cursor, ...data }: Omit<GetVacancyList, 'skip'>) => {
        const { url, apiToken } = checkConfig();
        const response = await fetch(`${url}/api/rest/vacancies/list`, {
            method: 'POST',
            headers: {
                authorization: apiToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...data, skip: cursor }),
        });
        const json: { vacancies: Vacancy[]; count: number } = await response.json();
        return json;
    },
};
