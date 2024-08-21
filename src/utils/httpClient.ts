import axios from 'axios';
import qs from 'qs';

import config from '../config';

import { Paths } from './paths';

export const axiosInstance = axios.create({
    paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
});

axiosInstance.interceptors.response.use(
    (response) => Promise.resolve(response),
    (error) => {
        if (error.response?.status === 401) {
            if (document.location.pathname !== Paths.DEBUG_AUTH) {
                if (config.debugCookieEnabled) {
                    document.location.href = Paths.DEBUG_AUTH;
                } else {
                    document.location.href = Paths.AUTH_SIGNIN;
                }
            }
        }

        return Promise.reject(error);
    },
);

export const httpClient = {
    get: <T>(url: string, params?: Record<string, unknown>): Promise<T> =>
        axiosInstance.get<T>(url, { params }).then((res) => res.data),

    post: <T>(url: string, data: Record<string, unknown>): Promise<T> =>
        axiosInstance.post<T>(url, data).then((res) => res.data),

    postFiles: <T>(url: string, data: Record<string, unknown> | FormData): Promise<T> =>
        axiosInstance
            .post<T>(url, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then((res) => res.data),

    put: <T>(url: string, data: Record<string, unknown>): Promise<T> =>
        axiosInstance.put<T>(url, data).then((res) => res.data),

    delete: <T>(url: string, data?: Record<string, unknown>): Promise<T> =>
        axiosInstance.delete<T>(url, { data }).then((res) => res.data),
};
