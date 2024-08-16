import { useMemo } from 'react';

import { distanceDate, formatDateToLocaleString } from '../utils/date';

import { useLocale } from './useLocale';

export const useDistanceDate = (initialValue: Date): string => {
    const locale = useLocale();
    const value = useMemo(() => distanceDate(initialValue, locale), [initialValue, locale]);

    return value;
};

export const useFormatDateToLocaleString = (initialValue: Date): string => {
    const value = useMemo(() => formatDateToLocaleString(initialValue), [initialValue]);

    return value;
};
