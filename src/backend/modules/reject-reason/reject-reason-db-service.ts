import { RejectReason } from '@prisma/client';

import { prisma } from '../..';

const findAll = (): Promise<RejectReason[]> => {
    return prisma.rejectReason.findMany();
};

export const rejectReasonDbService = { findAll };
