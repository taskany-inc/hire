import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';

import { TrpcContext } from './trpcContext';

const t = initTRPC.context<TrpcContext>().create({
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

export const { middleware } = t;
export const { router } = t;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(isAuthed);
