import { useCallback, useEffect } from 'react';

export const useKeydownListener = (
    shouldBlockEventHandling: (e: KeyboardEvent) => boolean,
    options?: AddEventListenerOptions,
): void => {
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (shouldBlockEventHandling(e)) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        window.addEventListener('keydown', handleKeyPress, options);

        return () => window.removeEventListener('keydown', handleKeyPress, options);
    }, [options, shouldBlockEventHandling]);
};

export const useKeyboardShortcut = (key: string, handler: VoidFunction): void => {
    const shouldBlockEventHandling = useCallback(
        (e: KeyboardEvent) => {
            if (e.key !== key) {
                return false;
            }

            handler();

            return true;
        },
        [key, handler],
    );

    useKeydownListener(shouldBlockEventHandling);
};
