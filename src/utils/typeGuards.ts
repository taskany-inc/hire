import { ProblemDifficulty } from '@prisma/client';
import { AxiosError } from 'axios';

// TODO: change any to unknown
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

export const isBoolean = (value: any): value is boolean => typeof value === 'boolean';

export const isString = (value: any): value is string => typeof value === 'string';

export const isNonEmptyString = (value: any): value is string => typeof value === 'string' && value.length > 0;

const numberStringRE = /\d+/;
export const isNumberString = (value: any): value is string => isString(value) && numberStringRE.test(value);

export const isArray = (value: any): value is unknown[] => Array.isArray(value);

export const isStringArray = (value: any): value is string[] =>
    isArray(value) && value.every((v) => typeof v === 'string');

export const isNumberStringArray = (value: any): value is string[] =>
    isStringArray(value) && value.every(isNumberString);

export const isObject = (value: any): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !isArray(value);

export const isAxiosError = (value: any): value is AxiosError => isObject(value) && value.isAxiosError === true;

export const isProblemDifficulty = (value: string): value is ProblemDifficulty => {
    const values: string[] = Object.values(ProblemDifficulty);

    return values.includes(value);
};

export const isSomeEnum = <T extends Record<string, unknown>>(e: T, token: any): token is T[keyof T] =>
    Object.values(e).includes(token as T[keyof T]);
