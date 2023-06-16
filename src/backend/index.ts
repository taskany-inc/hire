import { PrismaClient, Prisma } from '@prisma/client';

import config from './config';

// eslint-disable-next-line import/no-mutable-exports
export let prisma: PrismaClient;

if (typeof window === 'undefined') {
    if (process.env.NODE_ENV === 'production') {
        prisma = new PrismaClient(config.prisma.options as Prisma.PrismaClientOptions);
    } else {
        if (!global.prisma) {
            global.prisma = new PrismaClient(config.prisma.options as Prisma.PrismaClientOptions);
        }
        prisma = global.prisma;
    }

    /* Keycloak provider sends some extra-fields
    that Prisma ORM cannot apply in migrations or
    standard OAuth Account schema names several fields another way
    Link to github issue: https://github.com/nextauthjs/next-auth/issues/3823
    */
    prisma.$use(async (params, next) => {
        if (params.action === 'create' && params.model === 'Account') {
            delete params.args.data['not-before-policy'];
        }

        return next(params);
    });
}
