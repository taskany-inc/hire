import { parseError } from './errorParsing';

export const tryGetAsyncValue = async <T>(cb: () => Promise<T>, fallback?: T): Promise<T | undefined> => {
    try {
        return cb();
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(parseError(e));
        return fallback;
    }
};

export const resolveAsyncValue = <T>(promise: Promise<T>): PromiseLike<[T, null] | [null, Error]> => {
    return promise.then(
        (data) => [data, null],
        (error) => [null, error],
    );
};
