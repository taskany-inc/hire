import { useMemo } from 'react';

import { distanceDate, formatDateToLocaleString } from '../utils/date';

export const useDistanceDate = (initialValue: Date): string => {
    const value = useMemo(() => distanceDate(initialValue), [formatDateToLocaleString, initialValue]);

    return value;
};

export const useFormatDateToLocaleString = (initialValue: Date): string => {
    const value = useMemo(() => formatDateToLocaleString(initialValue), [formatDateToLocaleString, initialValue]);

    return value;
};
