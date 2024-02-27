import { prisma } from '../utils/prisma';

export const appConfigMethods = {
    get: async () => {
        try {
            return await prisma.appConfig.findFirst();
        } catch (e) {
            return null;
        }
    },
};
