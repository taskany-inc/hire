import { Prisma } from '@prisma/client';

import { wrapValueInObjPath } from './objects';

export interface SearchSettings {
    minSearchLength: number;
    fieldsToSearchFrom: string[];
}

type ItemListParams = {
    search?: string;
};

interface ItemListOrderParams {
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
}

type ItemListWhere<TPrismaWhereInput> = {
    OR?: TPrismaWhereInput[];
};

export function buildItemListWhere<TPrismaWhereInput extends Record<string, Prisma.StringFilter | unknown>>(
    params: ItemListParams,
    searchSettings: SearchSettings,
): ItemListWhere<TPrismaWhereInput> {
    const { search } = params;
    const where: ItemListWhere<TPrismaWhereInput> = {} as TPrismaWhereInput;

    if (search && search.length >= searchSettings.minSearchLength) {
        const whereSearchCondition: Prisma.StringFilter = {
            contains: search,
            mode: 'insensitive',
        } as Prisma.StringFilter;

        where.OR = searchSettings.fieldsToSearchFrom.map(
            (field): TPrismaWhereInput => wrapValueInObjPath(whereSearchCondition, field) as TPrismaWhereInput,
        );
    }

    return where;
}

type AnyPrismOrderByInput = Record<string, Prisma.SortOrder | Record<string, unknown>>;

export const buildItemListOrderBy = <TPrismaOrderByInput extends AnyPrismOrderByInput>(
    params: ItemListOrderParams,
    defaultOrderBy: TPrismaOrderByInput,
): TPrismaOrderByInput[] => {
    if (!params.orderBy) {
        return [defaultOrderBy];
    }

    const customOrderBy = wrapValueInObjPath(params.orderDirection ?? 'asc', params.orderBy) as TPrismaOrderByInput;

    return [customOrderBy, defaultOrderBy];
};
