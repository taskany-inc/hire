import { QueryClientConfig } from '@tanstack/react-query';
import { httpBatchLink, TRPCClientError } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import superjson from 'superjson';

import config from '../backend/config';
import type { TrpcRouter } from '../backend/trpc/routers/_trpc-router';

import { readBooleanFromMetaTag } from './frontend';
import { Paths } from './paths';
import { tr } from './utils.i18n';

const QUERY_RETRIES = 3;
const QUERY_STALE_TIME = 60 * 1000;

const handleUnauthorizedErrorOnClient = (error: unknown): boolean => {
    if (typeof window === 'undefined') return false;

    if (!(error instanceof TRPCClientError)) return false;

    if (error.data?.code !== 'UNAUTHORIZED') return false;

    const isNextAuthEnabled = readBooleanFromMetaTag('isNextAuthEnabled');
    const isDebugCookieAllowed = readBooleanFromMetaTag('isDebugCookieAllowed');

    if (isDebugCookieAllowed) {
        if (document.location.pathname !== Paths.DEBUG_AUTH) {
            document.location.href = Paths.DEBUG_AUTH;
        }
    } else if (isNextAuthEnabled) {
        document.location.href = Paths.AUTH_SIGNIN;
    } else {
        throw new Error(tr('No auth options available!'));
    }

    return true;
};

export const trpc = createTRPCNext<TrpcRouter>({
    config: ({ ctx }) => {
        const commonOptions: {
            transformer: typeof superjson;
            queryClientConfig: QueryClientConfig;
        } = {
            transformer: superjson,
            queryClientConfig: {
                defaultOptions: {
                    queries: {
                        staleTime: QUERY_STALE_TIME,
                        retry: (failureCount, error) => {
                            if (handleUnauthorizedErrorOnClient(error)) {
                                return false;
                            }

                            return failureCount < QUERY_RETRIES;
                        },
                    },
                    mutations: {
                        retry: (_, error) => {
                            handleUnauthorizedErrorOnClient(error);

                            return false;
                        },
                    },
                },
            },
        };

        // on client
        if (typeof window !== 'undefined') {
            return {
                ...commonOptions,
                links: [
                    httpBatchLink({
                        url: '/api/trpc',
                    }),
                ],
            };
        }

        // on server
        // https://trpc.io/docs/ssr
        return {
            ...commonOptions,
            links: [
                httpBatchLink({
                    url: `${config.defaultPageURL}/api/trpc`,
                    headers: () => {
                        if (ctx?.req) {
                            // To use SSR properly, you need to forward the client's headers to the server
                            // This is so you can pass through things like cookies when we're server-side rendering
                            const { connection, ...headers } = ctx.req.headers;

                            return {
                                ...headers,
                                // Optional: inform server that it's an SSR request
                                'x-ssr': '1',
                            };
                        }

                        return {};
                    },
                }),
            ],
        };
    },

    ssr: false,
});
