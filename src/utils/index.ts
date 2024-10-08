import { ProblemDifficulty } from '@prisma/client';
import { GetServerSidePropsContext } from 'next';

import { Option } from './types';
import { problemDifficultyLabels } from './dictionaries';
import { tr } from './utils.i18n';

export const noop = (): void => {};

export const objKeys = <T extends Record<string, unknown>>(obj: T): (keyof T)[] => Object.keys(obj);

export const entitiesToOptions = <T extends { id: number; name?: string; description?: string }>(
    value: T | T[] = [],
): Option[] => {
    const entities = Array.isArray(value) ? value : [value];

    return entities.map((entity) => ({
        value: entity.id,
        text: entity.name ?? entity.description ?? tr('No name or description!'),
    }));
};

export const joinStrings = (strings: string | string[] | undefined): string | undefined =>
    Array.isArray(strings) ? strings.join(', ') : strings;

type Enum = Record<string, string>;
type EnumMapper<K, R> = (key: K, value: string) => R;

export const mapEnum = <E extends Enum, R>(en: E, func: EnumMapper<keyof E, R>): R[] =>
    Object.keys(en).map((key) => func(key, en[key]));

const createSelectOption = (enumOptions: Enum, labels: Record<string, string>) =>
    Object.values(enumOptions).map((item) => {
        return { value: item, text: labels[item] };
    });

export const difficultyToColor: Record<ProblemDifficulty, string> = {
    HARD: '#f85149',
    MEDIUM: '#fac905',
    EASY: '#18e022',
};

export const difficultyOption = createSelectOption(ProblemDifficulty, problemDifficultyLabels).map((option) => ({
    ...option,
    id: option.value,
    stateDotColor: difficultyToColor[option.value as ProblemDifficulty],
}));

// TODO: delete proxy
export { parseEntityDates } from './date';

export type Browser = 'safari' | undefined;

export const detectBrowserFromRequest = (req: GetServerSidePropsContext['req']): Browser => {
    if (req.headers['user-agent']?.match(/safari/i)) {
        return 'safari';
    }
};

export class ErrorWithStatus extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const times = (n: number, cb: VoidFunction): void => {
    while (n-- > 0) {
        cb();
    }
};

export const yearInSeconds = 31536000;

export const minuteInSeconds = 60000;

export const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const assertNever = (_value: never) => {};

export const getPieChartSliceColor = (value: number) => {
    const hue = ((Math.sin(value) + 1) / 2) * 360;

    return `hsl(${hue} 30% 60%)`;
};

export const RADIAN = Math.PI / 180;

export const mapInterval = (in1Start: number, in1End: number, in2Start: number, in2End: number, value: number) =>
    ((value - in1Start) * (in2End - in2Start)) / (in1End - in1Start) + in2Start;

export const idsToIdObjs = <T extends string | number>(ids: T[]): { id: T }[] => ids.map((id) => ({ id }));

export const idObjsToIds = <T extends string | number>(idObjs: { id: T }[]): T[] => idObjs.map((idObj) => idObj.id);

export const onlyUnique = <T>(value: T, index: number, self: T[]) => self.indexOf(value) === index;

export const contextNotInitialized = (message: string) => () => {
    throw new Error(message);
};

interface EntityData {
    id: string | number;
    name: string;
}

interface TEntity {
    id: string | number;
    name?: string | null;
    email?: string;
}

export function arrayToAppliedString<T extends TEntity>(
    array: T[],
    ids: Array<number | string>,
    title: string,
    key: keyof T,
): string {
    const map: Record<string, EntityData> = array.reduce(
        (result, current: T) => ({
            ...result,
            [current[key] as string]: { id: current[key], name: current.email || current.name },
        }),
        {},
    );

    const arrayApplied = ids.reduce((acc, rec, index) => {
        if (!map[rec]?.name) {
            return acc;
        }
        const name = index === ids.length - 1 ? map[rec]?.name : `${map[rec].name}, `;

        return acc + name;
    }, '');
    return `${title}${arrayApplied}. `;
}
