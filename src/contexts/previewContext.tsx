import { createContext, FC, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

export const noop = (): void => {};

interface PreviewContext {
    showSectionPreview: (sectionId: number) => void;
    sectionId?: number;

    hidePreview: () => void;
}

export const previewContext = createContext<PreviewContext>({
    showSectionPreview: noop,
    hidePreview: noop,
});

export const PreviewContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const [sectionId, setSectionId] = useState<number>();

    const hidePreview = useCallback(() => {
        setSectionId(undefined);
    }, []);

    const value: PreviewContext = useMemo(
        () => ({
            showSectionPreview: setSectionId,
            sectionId,
            hidePreview,
        }),
        [sectionId, hidePreview],
    );

    return <previewContext.Provider value={value}>{children}</previewContext.Provider>;
};

export const usePreviewContext = () => useContext(previewContext);