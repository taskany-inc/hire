import { TRPCError } from '@trpc/server';

import config from '../config';
import { defaultListLimit } from '../utils/constants';

import { Vacancy, GetVacancyList, EditVacancy, Group, GetGroupList } from './crewTypes';

const checkConfig = () => {
    if (!config.crew.url || !config.crew.apiToken) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Crew integration is not configured' });
    }
    return { url: config.crew.url, apiToken: config.crew.apiToken };
};

const getDataFromResponse = async <T>(response: Response): Promise<T> => {
    if (response.ok) {
        return response.json();
    }
    const message = await response.text();
    throw new TRPCError({ code: 'BAD_REQUEST', message });
};

const vacancyListTake = 30;

export const crewMethods = {
    getVacancyById: async (vacancyId: string) => {
        const { url, apiToken } = checkConfig();
        const response = await fetch(`${url}/api/rest/vacancy/${vacancyId}`, {
            method: 'GET',
            headers: {
                authorization: apiToken,
            },
        });
        return getDataFromResponse<Vacancy>(response);
    },

    getVacancyList: async ({ cursor, take = vacancyListTake, ...data }: Omit<GetVacancyList, 'skip'>) => {
        const { url, apiToken } = checkConfig();
        const response = await fetch(`${url}/api/rest/vacancies/list`, {
            method: 'POST',
            headers: {
                authorization: apiToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...data, take, skip: cursor }),
        });
        return getDataFromResponse<{ vacancies: Vacancy[]; count: number; total: number }>(response);
    },

    editVacancy: async (data: EditVacancy) => {
        const { url, apiToken } = checkConfig();
        const response = await fetch(`${url}/api/rest/vacancy`, {
            method: 'POST',
            headers: {
                authorization: apiToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return getDataFromResponse<Vacancy>(response);
    },

    getGroupList: async (data: GetGroupList) => {
        const { search, take, filter } = data;
        const { url, apiToken } = checkConfig();
        const response = await fetch(`${url}/api/rest/groups/list`, {
            method: 'POST',
            headers: {
                authorization: apiToken,
            },
            body: JSON.stringify({ search, take: take || defaultListLimit, filter }),
        });
        return getDataFromResponse<Group[]>(response);
    },
};
