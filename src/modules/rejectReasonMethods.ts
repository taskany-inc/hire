import { RejectReason } from '@prisma/client';

import { prisma } from '../utils/prisma';

const findAll = (): Promise<RejectReason[]> => {
    return prisma.rejectReason.findMany();
};

export const rejectReasonMethods = { findAll };
