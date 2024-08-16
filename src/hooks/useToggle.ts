import { useCallback, useState } from 'react';

export const useToggle = (initialState: boolean): [boolean, () => void] => {
    const [value, setValue] = useState<boolean>(initialState);

    const toggle = useCallback(() => {
        setValue((v) => !v);
    }, []);

    return [value, toggle];
};
