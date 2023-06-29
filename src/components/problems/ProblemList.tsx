import { useRouter } from 'next/router';
import { CSSProperties, useCallback, useRef } from 'react';
import { Text } from '@taskany/bricks';

import { useProblemFilterContext } from '../../contexts/problem-filter-context';
import { useProblems } from '../../hooks/problem-hooks';
import { parseNumber } from '../../utils/param-parsers';
import { Stack } from '../layout/Stack';
import { QueryResolver } from '../QueryResolver';

import { ProblemCard } from './ProblemCard';

import { tr } from './problems.i18n';

type ProblemListProps = {
    embedded?: boolean;
    className?: string;
    style?: CSSProperties;
    isSmallSize?: boolean;
    interviewId?: number;
};

export const ProblemList = ({
    className,
    style,
    embedded,
    isSmallSize,
    interviewId,
}: ProblemListProps): JSX.Element => {
    const { debouncedSearch, difficulty, author, tagIds } = useProblemFilterContext();
    const router = useRouter();
    const sectionId = parseNumber(router.query.sectionId);

    const problemsQuery = useProblems({
        excludeInterviewId: interviewId,
        search: debouncedSearch,
        difficulty,
        tagIds,
        authorId: author?.id ?? undefined,
        sectionId,
        limit: 20,
    });
    const { isFetching, hasNextPage, fetchNextPage } = problemsQuery;
    const observer = useRef<IntersectionObserver | null>(null);
    const ref = useCallback(
        (node: HTMLDivElement) => {
            if (isFetching) return;

            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasNextPage) {
                    fetchNextPage();
                }
            });

            if (node) observer.current.observe(node);
        },
        [hasNextPage, fetchNextPage, isFetching],
    );

    return (
        <Stack direction="column" gap={32} className={className} style={style}>
            <QueryResolver queries={[problemsQuery]}>
                {([problems]) => {
                    return (
                        <>
                            {problems.pages.map((page, i) =>
                                page.total === 0 ? (
                                    <Text key={`${i}-${page.nextCursor}`}>
                                        {tr('Nothing found')} 😔
                                    </Text>
                                ) : (
                                    page.items.map((problem) => (
                                        <ProblemCard
                                            key={problem.id}
                                            problem={problem}
                                            embedded={embedded}
                                            isSmallSize={isSmallSize}
                                        />
                                    ))
                                ),
                            )}
                            <div ref={ref}>{isFetching && <Text>{tr('Loading problems')} ⏳</Text>}</div>
                        </>
                    );
                }}
            </QueryResolver>
        </Stack>
    );
};
