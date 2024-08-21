import { QueryClientConfig } from '@tanstack/react-query';
import { httpBatchLink, TRPCClientError } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import superjson from 'superjson';

import { Paths } from '../utils/paths';
import config from '../config';

import type { TrpcRouter } from './routers';

const QUERY_RETRIES = 3;
const QUERY_STALE_TIME = 60 * 1000;

const handleUnauthorizedErrorOnClient = (error: unknown): boolean => {
    if (typeof window === 'undefined') return false;

    if (!(error instanceof TRPCClientError)) return false;

    if (error.data?.code !== 'UNAUTHORIZED') return false;

    if (document.location.pathname !== Paths.DEBUG_AUTH) {
        if (config.debugCookieEnabled) {
            document.location.href = Paths.DEBUG_AUTH;
        } else {
            document.location.href = Paths.AUTH_SIGNIN;
        }
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
                    url: '/api/trpc',
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
