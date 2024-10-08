export const deduplicateByKey = <T>(items: T[], getKey: (item: T) => string | number): T[] => {
    const set = new Set<string | number>();
    const result: T[] = [];
    items.forEach((item) => {
        const key = getKey(item);
        if (!set.has(key)) {
            set.add(key);
            result.push(item);
        }
    });
    return result;
};
