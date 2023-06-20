import * as Sentry from '@sentry/nextjs';
import { TRPCError } from '@trpc/server';
import { ErrorWithStatus } from './src/utils';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
    if (process.env.NODE_ENV === 'production') {
        Sentry.init({
            dsn: SENTRY_DSN,
            tracesSampleRate: 1.0,
            release: process.env.SENTRY_RELEASE,
            beforeSend: (event, hint) => {
                if (
                    hint.originalException instanceof TRPCError &&
                    hint.originalException.code !== 'INTERNAL_SERVER_ERROR'
                ) {
                    return null;
                }

                if (hint.originalException instanceof ErrorWithStatus && hint.originalException.statusCode !== 500) {
                    return null;
                }

                return event;
            },
        });
    }
}
