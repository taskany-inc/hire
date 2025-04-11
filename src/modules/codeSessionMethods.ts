import { TRPCError } from '@trpc/server';

import config from '../config';

import { CreateSession } from './codeSessionTypes';

const checkConfig = () => {
    if (!config.code.url || !config.code.apiToken || !config.code.claimSessionLink) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Code integration is not configured' });
    }

    const re = /{sessionId}/g; // placeholder template

    // check link template is contains placeholder
    if (config.code.claimSessionLink.match(re) == null) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Code integration is not configured' });
    }

    return {
        url: config.code.url,
        apiToken: config.code.apiToken,
        claimSessionLink: config.code.claimSessionLink,
    };
};

enum endpoint {
    sessionCreate = 'session/create',
}

interface RequestPayload {
    [endpoint.sessionCreate]: CreateSession['payload'];
}

interface EndpointResponse {
    [endpoint.sessionCreate]: CreateSession['response'];
}

interface PostRequestGetter {
    <T extends keyof EndpointResponse, B extends RequestPayload[T], R = EndpointResponse[T]>(path: T): (
        body: B,
    ) => Promise<R>;
}

const post: PostRequestGetter = (path) => {
    const { url, apiToken } = checkConfig();

    return (body) =>
        fetch(`${url}/api/rest/${path}`, {
            method: 'POST',
            headers: {
                authorization: apiToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }).then(async (res) => {
            if (res.ok) {
                return res.json();
            }

            const message = await res.text();
            throw new TRPCError({ code: 'BAD_REQUEST', message });
        });
};

export const createSession = post(endpoint.sessionCreate);

export const codeSessionMethods = {
    createSession: async (title: string) => {
        return createSession({ title });
    },
    readConfing: async () => {
        return checkConfig();
    },
};
