import { prisma } from '../utils/prisma';

export const gradeMethods = {
    getOptions: async () => {
        const options = await prisma.grades.findMany();
        return options.map((o) => o.options);
    },
};
