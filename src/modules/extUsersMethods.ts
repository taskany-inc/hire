import axios from 'axios';

import config from '../config';
import { ErrorWithStatus } from '../utils';

import { tr } from './modules.i18n';

export interface User {
    _id: string;
    email: string;
    additionalEmails: string[];
    fullName: string;
}

const base = {
    baseURL: config.sourceUsers.sourceOfUsersUrl,
    headers: {
        Authorization: `Basic ${config.sourceUsers.sourceOffUsersAccessToken}`,
        'X-Requested-With': 'XMLHttpRequest',
    },
};

const getExternalUser = async (email: string): Promise<User> => {
    const res = await axios({
        ...base,
        url: config.sourceUsers.sourceOfUsersByEmail,
        params: {
            email,
        },
        method: 'GET',
    });

    if (res.status !== 200) {
        throw new ErrorWithStatus(tr('External user error: {res}', { res: res.statusText }), res.status);
    }

    return res.data;
};

const searchUsers = async (search: string): Promise<User[]> => {
    const result = await axios({
        ...base,
        url: config.sourceUsers.searchUsersList,
        params: {
            search,
            limit: 10,
            offset: 0,
        },
        method: 'POST',
    });

    return result.data.items;
};

export const externalUsersMethods = {
    getExternalUser,
    searchUsers,
};
