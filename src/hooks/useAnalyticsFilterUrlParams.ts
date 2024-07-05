import { HireStream } from '@prisma/client';
import { useUrlParams } from '@taskany/bricks';
import { useRouter } from 'next/router';
import { useCallback, useLayoutEffect } from 'react';

const YEAR = 1000 * 60 * 60 * 24 * 365;
const QUARTER = 1000 * 60 * 60 * 24 * 30 * 3;
const MONTH = 1000 * 60 * 60 * 24 * 30;
const WEEK = 1000 * 60 * 60 * 24 * 7;

export const useAnalyticsFilterUrlParams = (allStreams: HireStream[] = []) => {
    const router = useRouter();
    const pushUrl = useCallback((url: string) => router.push(url), [router]);
    const { values, setter } = useUrlParams(
        {
            streams: 'numberArray',
            startDate: 'number',
            endDate: 'number',
            periodTitle: 'string',
        },
        router.query,
        pushUrl,
    );

    const onChangeHireStreams = useCallback((streams: HireStream[]) => {
        setter(
            'streams',
            streams.map(({ id }) => id),
        );
    }, []);

    const setPeriodTitle = useCallback((title: string) => {
        setter('periodTitle', title);
    }, []);

    const setStartDate = useCallback((date: Date) => {
        setter('startDate', date.getTime());
    }, []);

    const setEndDate = useCallback((date: Date) => {
        setter('endDate', date.getTime());
    }, []);

    const setYear = useCallback(() => {
        setEndDate(new Date(Date.now()));
        setStartDate(new Date(Date.now() - YEAR));
        setPeriodTitle('Year');
    }, []);

    const setQuarter = useCallback(() => {
        setEndDate(new Date(Date.now()));
        setStartDate(new Date(Date.now() - QUARTER));
        setPeriodTitle('Quarter');
    }, []);

    const setMonth = useCallback(() => {
        setEndDate(new Date(Date.now()));
        setStartDate(new Date(Date.now() - MONTH));
        setPeriodTitle('Month');
    }, []);

    const setWeek = useCallback(() => {
        setEndDate(new Date(Date.now()));
        setStartDate(new Date(Date.now() - WEEK));
        setPeriodTitle('Week');
    }, []);

    const clearFilters = useCallback(() => {
        onChangeHireStreams([]);
    }, []);

    useLayoutEffect(() => {
        if (!values.endDate && !values.startDate) {
            setYear();
        }
    }, []);

    return {
        startDate: new Date(values.startDate as number),
        endDate: new Date(values.endDate as number),
        hireStreams: allStreams.filter(({ id }) => values.streams?.includes(id)),
        periodTitle: values.periodTitle ?? 'Year',
        setter,
        values,
        setStartDate,
        setEndDate,
        setPeriodTitle,
        setWeek,
        setMonth,
        setQuarter,
        setYear,
        setHireStreams: onChangeHireStreams,
        clearFilters,
    };
};
