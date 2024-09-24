import { createContext, FC, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

export const noop = (): void => {};

interface PreviewContext {
    showSectionPreview: (sectionId: number) => void;
    showAddProblemToSectionPreview: (params: { interviewId: number; sectionId: number }) => void;
    sectionId?: number;
    problemToSectionPreview?: {
        interviewId: number;
        sectionId: number;
    };
    hidePreview: () => void;
}

export const previewContext = createContext<PreviewContext>({
    showSectionPreview: noop,
    hidePreview: noop,
    showAddProblemToSectionPreview: noop,
});

export const PreviewContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const [sectionId, setSectionId] = useState<number>();
    const [problemToSectionPreview, setProblemToSectionPreview] = useState<{
        interviewId: number;
        sectionId: number;
    }>();

    const hidePreview = useCallback(() => {
        setSectionId(undefined);
        setProblemToSectionPreview(undefined);
    }, []);

    const value: PreviewContext = useMemo(
        () => ({
            showSectionPreview: setSectionId,
            showAddProblemToSectionPreview: setProblemToSectionPreview,
            sectionId,
            hidePreview,
            problemToSectionPreview,
        }),
        [sectionId, problemToSectionPreview, hidePreview],
    );

    return <previewContext.Provider value={value}>{children}</previewContext.Provider>;
};

export const usePreviewContext = () => useContext(previewContext);
