import { useEffect, useRef } from 'react';

export const useOnChangeRef = <T>(value: T, onChange?: (value: T) => void) => {
    const statePrev = useRef<T>();

    useEffect(() => {
        if (value !== statePrev.current) {
            statePrev.current = value;
            onChange?.(value);
        }
    }, [value, onChange]);
};
