import { TRPCError } from '@trpc/server';

import config from '../config';
import { defaultListLimit } from '../utils/constants';

import {
    Vacancy,
    GetVacancyList,
    EditVacancy,
    Group,
    GetGroupList,
    GiveAchievement,
    GetAchievements,
    Achievement,
    CrewUserNameAndEmail,
    CrewUser,
    CrewUserShort,
} from './crewTypes';

const checkConfig = () => {
    if (!config.crew.url || !config.crew.apiToken) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Crew integration is not configured' });
    }
    return { url: config.crew.url, apiToken: config.crew.apiToken };
};

const fetchGet = (extension: string) => {
    const { url, apiToken } = checkConfig();

    return fetch(`${url}/${extension}`, {
        method: 'GET',
        headers: {
            authorization: apiToken,
        },
    });
};

const fetchPost = (extension: string, body: string) => {
    const { url, apiToken } = checkConfig();

    return fetch(`${url}/${extension}`, {
        method: 'POST',
        headers: {
            authorization: apiToken,
            'Content-Type': 'application/json',
        },
        body,
    });
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
        const response = await fetchGet(`api/rest/vacancy/${vacancyId}`);

        return getDataFromResponse<Vacancy>(response);
    },

    getVacancyList: async ({ cursor, take = vacancyListTake, ...data }: Omit<GetVacancyList, 'skip'>) => {
        const response = await fetchPost('api/rest/vacancies/list', JSON.stringify({ ...data, take, skip: cursor }));

        return getDataFromResponse<{ vacancies: Vacancy[]; count: number; total: number }>(response);
    },

    editVacancy: async (data: EditVacancy) => {
        const response = await fetchPost('api/rest/vacancy', JSON.stringify(data));
        return getDataFromResponse<Vacancy>(response);
    },

    getGroupList: async (data: GetGroupList) => {
        const { take, ...restData } = data;
        const response = await fetchPost(
            'api/rest/groups/list',
            JSON.stringify({ take: take || defaultListLimit, ...restData }),
        );
        return getDataFromResponse<Group[]>(response);
    },

    getUserInfo: async (email: string) => {
        const params = new URLSearchParams({ field: 'email', value: email });
        const response = await fetchGet(`api/rest/users/get-by-field?${params}`);
        return getDataFromResponse<CrewUser>(response);
    },

    searchUsers: async (query: string) => {
        const params = new URLSearchParams({ query });
        const response = await fetchGet(`api/rest/search/users?${params}`);
        return getDataFromResponse<CrewUserShort[]>(response);
    },

    getAchievements: async (data: GetAchievements) => {
        const { search, take } = data;
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (take) params.append('take', String(take));

        const response = await fetchGet(`api/rest/achievements/list?${params}`);
        return getDataFromResponse<Achievement[]>(response);
    },

    giveAchievement: async (data: GiveAchievement) => {
        const response = await fetchPost('api/rest/achievements/give', JSON.stringify(data));
        return getDataFromResponse<CrewUserNameAndEmail>(response);
    },
};
