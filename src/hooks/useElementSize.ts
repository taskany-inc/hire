import { RefObject, useEffect, useMemo, useRef, useState } from 'react';

interface Rect {
    width: number;
    height: number;
}

export const useElementSize = <T extends HTMLDivElement>(): [RefObject<T>, Rect] => {
    const ref = useRef<T>(null);
    const [rect, setRect] = useState<Rect>({ width: 0, height: 0 });

    const observer = useMemo(() => {
        if (typeof window === 'undefined') return null;
        const handleResize = () => {
            if (ref.current) {
                setRect({ width: ref.current.offsetWidth, height: ref.current.offsetHeight });
            }
        };
        handleResize();
        return new ResizeObserver(handleResize);
    }, []);

    useEffect(() => {
        if (!observer || !ref.current) return;
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [observer]);

    return [ref, rect];
};
