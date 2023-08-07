import { prisma } from '../../index';

export const gradesDbService = {
    getOptions: async () => {
        const options = await prisma.grades.findMany();
        return options.map((o) => o.options);
    },
};
