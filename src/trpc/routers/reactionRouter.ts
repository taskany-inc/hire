import { TRPCError } from '@trpc/server';

import { prisma } from '../../utils/prisma';
import { toggleReactionSchema } from '../../modules/reactionTypes';
import { protectedProcedure, router } from '../trpcBackend';

export const reactionRouter = router({
    toggle: protectedProcedure.input(toggleReactionSchema).mutation(async ({ ctx, input: { emoji, commentId } }) => {
        const isUserReaction = await prisma.reaction.findFirst({
            where: { emoji, commentId, userId: ctx.session.user.id },
        });

        try {
            if (isUserReaction) {
                return prisma.reaction.delete({
                    where: {
                        id: isUserReaction.id,
                    },
                });
            }

            return prisma.reaction.create({
                data: {
                    emoji,
                    commentId,
                    userId: ctx.session.user.id,
                },
            });
        } catch (error: any) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: String(error.message), cause: error });
        }
    }),
});
