import { FiltersApplied } from '@taskany/bricks';
import { useMemo } from 'react';
import { HireStream } from 'prisma/prisma-client';
import { gray7 } from '@taskany/colors';

import s from './AnalyticsFilterApplied.module.css';
import { tr } from './AnalyticsFilterApplied.i18n';

interface AnalyticsFilterAppliedProps {
    hireStreams?: HireStream[];
    periodTitle?: string;
}

export const AnalyticsFilterApplied = ({ hireStreams, periodTitle }: AnalyticsFilterAppliedProps) => {
    const filterAppliedString = useMemo(() => {
        let result = '';

        if (periodTitle) {
            result += `${tr('Period')}: ${periodTitle}. `;
        }

        if (hireStreams?.length) {
            result += `${tr('Streams')}: ${hireStreams.map(({ name }) => name).join(', ')}`;
        }

        return result;
    }, [hireStreams, periodTitle]);

    return (
        <FiltersApplied size="s" weight="bold" color={gray7} className={s.AnalyticsFilterApplied}>
            {filterAppliedString}
        </FiltersApplied>
    );
};
