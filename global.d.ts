import { PrismaClient } from '@prisma/client';

declare global {
    /* eslint-disable no-var */
    // eslint-disable-next-line vars-on-top
    var prisma: PrismaClient | undefined;
}