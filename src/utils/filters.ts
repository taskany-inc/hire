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
    const queryString = context.resolvedUrl.split('?')[1];

    const defaultFilterFallback = Boolean(!queryString && !context.req.cookies[filtersNoSearchPresetCookie]);

    if (defaultFilterFallback) {
        await ssg.filter.getDefaultFilter.fetch({ entity });
    }

    return {
        defaultFilterFallback,
    };
};
