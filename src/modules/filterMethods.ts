import { prisma } from '../utils/prisma';

import { GetDefaultFilter } from './filterTypes';

export const filterMethods = {
    getDefaultFilters: async ({ entity }: GetDefaultFilter) => {
        const defaults = await prisma.filter.findMany({
            where: {
                entity,
                default: true,
                user: null,
            },
        });

        return defaults;
    },
};
