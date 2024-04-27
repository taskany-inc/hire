import { isNumberString, isString } from './typeGuards';

export const parseNumber = (value: unknown): number | undefined => (isNumberString(value) ? +value : undefined);
export const parseString = (value: unknown): string | undefined =>
    isString(value) && value !== '' ? value : undefined;
