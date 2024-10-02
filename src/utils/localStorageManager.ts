import safeLocalStorage from 'safe-localstorage';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { Section } from '@prisma/client';

import { SolutionWithRelations } from '../modules/solutionTypes';

// TODO: fix false positive no-shadow
// eslint-disable-next-line no-shadow
enum LocalStorageKey {
    ITEMS_PER_PAGE = 'pageSize',
    SECTION_FEEDBACK = 'sectionFeedback',
    SOLUTION_ANSWER = 'solutionAnswer',
}

const PREFIX = 'Hire';

export class LocalStorageManager {
    private static setValue(key: string, value: string): void {
        // TODO: is there a better way to handle SSR?
        if (typeof window === 'undefined') {
            return;
        }
        safeLocalStorage.set(`${PREFIX}.${key}`, value);
    }

    private static getValue(key: string): string | undefined {
        // TODO: is there a better way to handle SSR?
        if (typeof window === 'undefined') {
            return;
        }

        return safeLocalStorage.get(`${PREFIX}.${key}`);
    }

    private static removeValue(key: string): void {
        return safeLocalStorage.remove(`${PREFIX}.${key}`);
    }

    static setPageSizeSetting(page: string, pageSize: number): void {
        this.setValue(`${LocalStorageKey.ITEMS_PER_PAGE}.${page}`, String(pageSize));
    }

    static getPageSizeSetting(page: string, defaultPageSize: number): number {
        const storedPageSize = this.getValue(`${LocalStorageKey.ITEMS_PER_PAGE}.${page}`);

        if (storedPageSize) {
            return +storedPageSize;
        }

        return defaultPageSize;
    }

    static setPersistedSectionFeedback(sectionId: number, feedback: string): void {
        this.setValue(`${LocalStorageKey.SECTION_FEEDBACK}.${sectionId}`, feedback);
    }

    static setPersistedSolutionAnswer(solutionId: number, answer: string): void {
        this.setValue(`${LocalStorageKey.SOLUTION_ANSWER}.${solutionId}`, answer);
    }

    static getPersistedSectionFeedback(sectionId: number): string | undefined {
        return this.getValue(`${LocalStorageKey.SECTION_FEEDBACK}.${sectionId}`);
    }

    static getPersistedSolutionAnswerFeedback(solutionId: number): string | undefined {
        return this.getValue(`${LocalStorageKey.SOLUTION_ANSWER}.${solutionId}`);
    }

    static removePersistedSectionFeedback(sectionId: number): void {
        this.removeValue(`${LocalStorageKey.SECTION_FEEDBACK}.${sectionId}`);
    }

    static removePersistedSolutionAnswer(solutionId: number): void {
        this.removeValue(`${LocalStorageKey.SOLUTION_ANSWER}.${solutionId}`);
    }
}

export function usePageSizeSetting(page: string, defaultValue = 20): [number, (v: number) => void] {
    const pageSize = useMemo(() => LocalStorageManager.getPageSizeSetting(page, defaultValue), [page, defaultValue]);

    const setPageSize = useCallback(
        (value: number): void => LocalStorageManager.setPageSizeSetting(page, value),
        [page],
    );

    return [pageSize, setPageSize];
}

export function useSectionFeedbackPersisting(
    section: Section,
    getFeedback: () => string | undefined | null,
): {
    stopPersistingFeedback: VoidFunction;
} {
    const router = useRouter();
    const sectionIdRef = useRef(section.id);
    const isPersisting = useRef(!section.feedback);

    const stopPersistingFeedback = useCallback(() => {
        isPersisting.current = false;
        LocalStorageManager.removePersistedSectionFeedback(section.id);
    }, [section.id]);

    useEffect(() => {
        const beforeUnloadHandler = () => {
            if (!isPersisting.current) {
                return;
            }
            const feedback = getFeedback();

            if (feedback) {
                LocalStorageManager.setPersistedSectionFeedback(section.id, feedback);
            }
        };

        window.addEventListener('offline', beforeUnloadHandler);
        window.addEventListener('beforeunload', beforeUnloadHandler);
        router.events.on('routeChangeStart', beforeUnloadHandler);

        return () => {
            window.removeEventListener('beforeunload', beforeUnloadHandler);
            window.removeEventListener('offline', beforeUnloadHandler);
            router.events.off('routeChangeStart', beforeUnloadHandler);
        };
    }, [section.id, getFeedback, router]);

    useEffect(
        () => () => {
            if (!isPersisting.current) {
                LocalStorageManager.removePersistedSectionFeedback(sectionIdRef.current);
            }
        },
        [],
    );

    return { stopPersistingFeedback };
}

export function useSectionSolutionAnswerPersisted(
    solution: SolutionWithRelations,
    getAnswer: () => string | undefined | null,
): {
    stopPersistingAnswer: VoidFunction;
} {
    const router = useRouter();
    const isPersisting = useRef(!solution.answer);
    const stopPersistingAnswer = useCallback(() => {
        isPersisting.current = false;
        LocalStorageManager.removePersistedSolutionAnswer(solution.id);
    }, [solution.id]);

    useEffect(() => {
        const beforeUnloadHandler = () => {
            if (!isPersisting.current) {
                return;
            }
            const answer = getAnswer();

            if (answer) {
                LocalStorageManager.setPersistedSolutionAnswer(solution.id, answer);
            }
        };

        window.addEventListener('beforeunload', beforeUnloadHandler);
        window.addEventListener('offline', beforeUnloadHandler);
        router.events.on('routeChangeStart', beforeUnloadHandler);

        return () => {
            window.removeEventListener('beforeunload', beforeUnloadHandler);
            window.removeEventListener('offline', beforeUnloadHandler);
            router.events.off('routeChangeStart', beforeUnloadHandler);
        };
    }, [solution.id, getAnswer, router]);

    useEffect(
        () => () => {
            if (!isPersisting.current) {
                LocalStorageManager.removePersistedSolutionAnswer(solution.id);
            }
        },
        [solution.id],
    );

    return { stopPersistingAnswer };
}
