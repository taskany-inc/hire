import { isObject } from './type-guards';

/**
 * @summary Wraps the value in nested objects at the given path as a string
 *
 * Designed to convert the string representation of a nested object -
 * for example for sorting in a prism:
 * @link https://www.prisma.io/docs/concepts/components/prisma-client/filtering-and-sorting#sort-by-relation
 *
 * @example
 * wrapValueInObjPath('asc', 'author.email') // => ({ author: { email: 'asc' } })
 */
export function wrapValueInObjPath<TValue>(value: TValue, path: string): Record<string, unknown> {
    return path
        .split('.')
        .reduceRight(
            (acc: TValue | Record<string, unknown>, prop): Record<string, unknown> => ({ [prop]: acc }),
            value,
        ) as Record<string, unknown>;
}

/**
 * @summary Get value from nested object by string path
 *
 * @example
 * getObjPathValue({ author: { email: 'asc' } }, 'author.email', '') // => 'asc'
 * getObjPathValue({ author: { email: 'asc' } }, 'author.name', 'nameless') // => 'nameless'
 */
export function getObjPathValue(obj: Record<string, unknown>, path: string, defaultValue?: unknown): unknown {
    return path
        .split('.')
        .reduce(
            (acc: Record<string, unknown> | unknown, prop) =>
                (isObject(acc) ? acc[prop] ?? defaultValue : defaultValue) as Record<string, unknown> | unknown,
            obj,
        );
}
