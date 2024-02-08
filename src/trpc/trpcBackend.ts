import { initTRPC, TRPCError } from '@trpc/server';
import { OpenApiMeta } from 'trpc-openapi';
import superjson from 'superjson';
import { ZodError } from 'zod';

import { prisma } from '../utils/prisma';

import { TrpcContext } from './trpcContext';

const t = initTRPC
    .context<TrpcContext>()
    .meta<OpenApiMeta>()
    .create({
        transformer: superjson,

        errorFormatter: ({ shape, error }) => {
            return {
                ...shape,
                data: {
                    ...shape.data,
                    zodError:
                        error.code === 'BAD_REQUEST' && error.cause instanceof ZodError ? error.cause.flatten() : null,
                },
            };
        },
    });

const isAuthed = t.middleware(({ next, ctx }) => {
    const { session } = ctx;

    if (!session) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
        });
    }

    return next({
        ctx: { session, headers: ctx.headers },
    });
});

const apiTokenCheck = t.middleware(async ({ next, ctx }) => {
    const header = ctx.headers.authorization;
    if (typeof header !== 'string') throw new TRPCError({ code: 'UNAUTHORIZED' });

    const token = await prisma.apiToken.findUnique({ where: { id: header } });
    if (!token) throw new TRPCError({ code: 'UNAUTHORIZED' });

    return next();
});

export const { middleware } = t;
export const { router } = t;

export const restProcedure = t.procedure.use(apiTokenCheck);
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(isAuthed);
