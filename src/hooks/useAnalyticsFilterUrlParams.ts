import { useCallback, useMemo } from 'react';
import { HireStream } from '@prisma/client';
import { useUrlParams } from '@taskany/bricks';
import { useRouter } from 'next/router';

const periods = {
    year: 1000 * 60 * 60 * 24 * 365,
    quarter: 1000 * 60 * 60 * 24 * 30 * 3,
    month: 1000 * 60 * 60 * 24 * 30,
    week: 1000 * 60 * 60 * 24 * 7,
};

export type AnalyticsPeriod = keyof typeof periods;

export const useAnalyticsFilterUrlParams = (allStreams: HireStream[] = []) => {
    const today = useMemo(() => new Date(), []);

    const router = useRouter();
    const pushUrl = useCallback((url: string) => router.push(url), [router]);
    const { values, setter, clearParams } = useUrlParams(
        {
            streams: 'numberArray',
            startDate: 'number',
            endDate: 'number',
            period: 'string',
        },
        router.query,
        pushUrl,
    );

    const parsedValues = useMemo(() => {
        const period =
            values.period && Object.keys(periods).includes(values.period)
                ? (values.period as AnalyticsPeriod)
                : undefined;

        let startDate = new Date(today.getTime() - periods.year);
        let endDate = today;
        if (period) {
            startDate = new Date(today.getTime() - periods[period]);
            endDate = today;
        } else if (values.startDate && values.endDate) {
            startDate = new Date(values.startDate);
            endDate = new Date(values.endDate);
        }

        const streams = values.streams?.length
            ? allStreams.filter(({ id }) => values.streams?.includes(id))
            : undefined;

        return { streams, startDate, endDate, period };
    }, [today, values.startDate, values.endDate, values.streams, values.period, allStreams]);

    const setPeriod = useCallback(
        (period?: AnalyticsPeriod) => {
            setter('period', period);
            setter('startDate', undefined);
            setter('endDate', undefined);
        },
        [setter],
    );

    const isFiltersEmpty = !values.period && !parsedValues.streams && !values.startDate && !values.endDate;

    return { values: parsedValues, setter, setPeriod, clearParams, isFiltersEmpty };
};
