export const countByKey = <T, K extends string | number>(
    items: T[],
    getKey: (item: T) => K | undefined,
): Map<K, number> => {
    const counts = new Map<K, number>();
    items.forEach((item) => {
        const key = getKey(item);
        if (key === undefined) return;
        const current = counts.get(key);
        if (current === undefined) {
            counts.set(key, 1);
        } else {
            counts.set(key, current + 1);
        }
    });
    return counts;
};
