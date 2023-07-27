import { GetServerSidePropsContext } from 'next';
import { DehydratedState } from '@tanstack/react-query';
import { Session } from 'next-auth';
import { TRPCError } from '@trpc/server';
import { getHTTPStatusCodeFromError } from '@trpc/server/http';
import { createProxySSGHelpers, DecoratedProcedureSSGRecord } from '@trpc/react-query/ssg';
import superjson from 'superjson';
import type { ErrorProps } from 'next/error';

import { TrpcRouter, trpcRouter } from '../backend/trpc/routers/_trpc-router';
import { AccessCheckResult } from '../backend/access/access-checks';

import { Paths } from './paths';
import { standConfig } from './stand';
import { parseNumber } from './param-parsers';
import { getServerSession } from './auth';

import { tr } from './utils.i18n';

import { Browser, detectBrowserFromRequest, ErrorWithStatus, objKeys } from '.';

type SsgHelper = DecoratedProcedureSSGRecord<TrpcRouter>;

type AccessChecksHandler = (...checks: (() => Promise<AccessCheckResult> | AccessCheckResult)[]) => Promise<void>;

type EmptyObj = Record<never, unknown> & { redirect?: { destination: string } };

type SsrOptions<
    Num extends string,
    Str extends string,
    ReqSession extends boolean,
    AdditionalProps extends EmptyObj,
    ActionArgs = {
        context: GetServerSidePropsContext;
        session: ReqSession extends true ? Session : null;
        ssg: SsgHelper;
        numberIds: Record<Num, number>;
        stringIds: Record<Str, string>;
        handleAccessChecks: AccessChecksHandler;
    },
> = {
    requireSession: ReqSession;
    numberIds?: Record<Num, true>;
    stringIds?: Record<Str, true>;
    action?: (args: ActionArgs) => Promise<AdditionalProps | void> | AdditionalProps | void;
};

type InferredServerSidePropsFromSSROptions<
    Num extends string,
    Str extends string,
    ReqSession extends boolean,
    AdditionalProps extends EmptyObj,
> =
    | {
          props: {
              session: ReqSession extends true ? Session : null;
              browser: Browser;
              trpcState: DehydratedState;
              numberIds: Record<Num, number>;
              stringIds: Record<Str, string>;
              error?: ErrorProps;
          } & AdditionalProps;
      }
    | {
          redirect: { destination: string };
          props: { session: Session | null; browser: Browser };
      };

export const createGetServerSideProps =
    <Num extends string, Str extends string, ReqSession extends boolean, AdditionalProps extends EmptyObj>(
        options: SsrOptions<Num, Str, ReqSession, AdditionalProps>,
    ) =>
    async (
        context: GetServerSidePropsContext,
    ): Promise<InferredServerSidePropsFromSSROptions<Num, Str, ReqSession, AdditionalProps>> => {
        const props: Record<string, unknown> = {};

        let session: Session | null = null;
        const browser = detectBrowserFromRequest(context.req);

        if (options.requireSession) {
            session = await getServerSession(context.req, context.res);

            if (!session) {
                if (standConfig.isDebugCookieAllowed) {
                    return {
                        redirect: { destination: Paths.DEBUG_AUTH },
                        props: { session, browser },
                    };
                }

                if (standConfig.isNextAuthEnabled) {
                    return {
                        redirect: { destination: Paths.AUTH_SIGNIN },
                        props: { session, browser },
                    };
                }

                throw new ErrorWithStatus(tr('No auth options available'), 500);
            }
            props.session = session;
        }

        const ssgHelper = createProxySSGHelpers({
            router: trpcRouter,
            ctx: { session },
            transformer: superjson,
        });

        const numberIds = {} as Record<Num, number>;
        const stringIds = {} as Record<Str, string>;

        if (options.numberIds) {
            for (const key of objKeys(options.numberIds)) {
                const id = parseNumber(context.query[key]);

                if (!id) {
                    throw new ErrorWithStatus(tr('Invalid numeric parameter {key} in address', { key }), 400);
                }

                numberIds[key] = id;
            }
        }

        if (options.stringIds) {
            for (const key of objKeys(options.stringIds)) {
                const id = context.query[key];

                if (!id || typeof id !== 'string') {
                    throw new ErrorWithStatus(tr('Invalid {key} string parameter in address', { key }), 400);
                }

                stringIds[key] = id;
            }
        }

        let additionalProps = {} as AdditionalProps;

        let error: ErrorProps | undefined;

        if (options.action) {
            const handleAccessChecks: AccessChecksHandler = async (...checks) => {
                for (const check of checks) {
                    // eslint-disable-next-line no-await-in-loop
                    const accessCheckResult = await check();

                    if (accessCheckResult.allowed === false) {
                        throw new ErrorWithStatus(accessCheckResult.errorMessage, 403);
                    }
                }
            };

            try {
                const actionResult = await options.action({
                    context,
                    session: session as any,
                    ssg: ssgHelper,
                    numberIds,
                    stringIds,
                    handleAccessChecks,
                });

                additionalProps = actionResult ?? ({} as AdditionalProps);

                if (additionalProps.redirect) {
                    return { redirect: additionalProps.redirect, props: { session, browser } };
                }
            } catch (e) {
                if (e instanceof TRPCError) {
                    const code = getHTTPStatusCodeFromError(e);
                    context.res.statusCode = code;
                    error = { statusCode: code, title: e.message };
                } else {
                    throw e;
                }
            }
        }

        return {
            props: {
                session: session as any,
                browser,
                trpcState: ssgHelper.dehydrate(),
                numberIds,
                stringIds,
                error,
                ...additionalProps,
            },
        };
    };
