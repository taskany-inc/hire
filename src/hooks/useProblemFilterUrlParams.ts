import { useUrlParams } from '@taskany/bricks';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { debounce } from 'throttle-debounce';

export const useProblemFilterUrlParams = () => {
    const router = useRouter();
    const pushUrl = useCallback((url: string) => router.push(url), [router]);
    const { values, setter, clearParams } = useUrlParams(
        {
            search: 'string',
            difficulty: 'stringArray',
            tag: 'numberArray',
            author: 'numberArray',
            interviewId: 'number',
            sectionId: 'number',
        },
        router.query,
        pushUrl,
    );
    const setSearch = debounce(300, (s) => setter('search', s));

    return { values, setter, clearParams, setSearch };
};
