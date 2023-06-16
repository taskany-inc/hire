export const idsToIdObjs = (ids: number[]): { id: number }[] => ids.map((id) => ({ id }));

export const idObjsToIds = (idObjs: { id: number }[]): number[] => idObjs.map((idObj) => idObj.id);

export const tryGetAsyncValue = async <T>(
    func: () => Promise<T>,
    defaultValue: T,
    errorMessage: string,
): Promise<T> => {
    try {
        const value = await func();

        return value ?? defaultValue;
    } catch (error) {
        // Intentional console.warn:
        // eslint-disable-next-line no-console
        console.warn(errorMessage);
        // eslint-disable-next-line no-console
        console.warn(error);

        return defaultValue;
    }
};

export const onlyUnique = <T>(value: T, index: number, self: T[]) => self.indexOf(value) === index;
