import { prisma } from '../utils/prisma';

export const appConfigMethods = {
    get: async () => {
        try {
            return await prisma.appConfig.findFirst({
                include: {
                    aiAssistant: {
                        include: {
                            options: true,
                        },
                    },
                },
            });
        } catch (e) {
            return null;
        }
    },

    setAiAssistant: async (aiAssistantId: string | null) => {
        try {
            const appConfig = await prisma.appConfig.findFirst();

            if (!appConfig) {
                return null;
            }

            return prisma.appConfig.update({
                where: { id: appConfig.id },
                data: {
                    aiAssistantId,
                },
                include: {
                    aiAssistant: {
                        include: {
                            options: true,
                        },
                    },
                },
            });
        } catch (e) {
            return null;
        }
    },
};
