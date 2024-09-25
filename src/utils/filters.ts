import { FilterEntity } from '@prisma/client';
import { GetServerSidePropsContext } from 'next';
import { DecoratedProcedureSSGRecord } from '@trpc/react-query/ssg';

import { TrpcRouter } from '../trpc/routers';
import { FiltersContext } from '../contexts/filtersContext';

type SsgHelper = DecoratedProcedureSSGRecord<TrpcRouter>;

export const filtersNoSearchPresetCookie = 'taskany.NoSearchPreset';

export const filtersSsrInit = async (
    entity: FilterEntity,
    context: GetServerSidePropsContext,
    ssg: SsgHelper,
): Promise<FiltersContext> => {
    const defaultFilterFallback = Boolean(
        !Object.keys(context.query).length && !context.req.cookies[filtersNoSearchPresetCookie],
    );

    if (defaultFilterFallback) {
        await ssg.filter.getDefaultFilter.fetch({ entity });
    }

    return {
        defaultFilterFallback,
    };
};
