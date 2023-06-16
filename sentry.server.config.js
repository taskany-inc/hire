// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import { TRPCError } from '@trpc/server';

import { stand } from './src/utils/stand';
import { ErrorWithStatus } from './src/utils';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
    dsn:
        process.env.NODE_ENV === 'development'
            ? null
            : SENTRY_DSN,
    environment: stand,
    beforeSend: (event, hint) => {
        if (hint.originalException instanceof TRPCError && hint.originalException.code !== 'INTERNAL_SERVER_ERROR') {
            return null;
        }

        if (hint.originalException instanceof ErrorWithStatus && hint.originalException.statusCode !== 500) {
            return null;
        }

        return event;
    },
    // ...
    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps
});
