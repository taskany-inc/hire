import { Reaction } from '@prisma/client';

import { prisma } from '../../index';

import { UpsertReaction } from './reaction-types';

const upsert = async (data: UpsertReaction): Promise<Reaction> => {
    const { name, interviewId, userId } = data;

    return prisma.reaction.upsert({
        where: { interviewId_userId: { interviewId, userId } },
        update: { name },
        create: data,
    });
};

export const reactionDbService = {
    upsert,
};
