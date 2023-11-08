import { useRouter } from 'next/router';
import { CSSProperties } from 'react';
import { Text } from '@taskany/bricks';

import { useProblemFilterContext } from '../../contexts/problem-filter-context';
import { useProblems } from '../../hooks/problem-hooks';
import { parseNumber } from '../../utils/param-parsers';
import { Stack } from '../layout/Stack';
import { QueryResolver } from '../QueryResolver';
import { LoadMoreProblemsButton } from '../LoadMoreProblemsButton';

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

    const { isLoading, hasNextPage, fetchNextPage } = problemsQuery;

    return (
        <Stack direction="column" gap={32} className={className} style={style}>
            <QueryResolver queries={[problemsQuery]}>
                {([problems]) => {
                    return (
                        <>
                            {problems.pages.map((page, i) =>
                                page.total === 0 ? (
                                    <Text key={`${i}-${page.nextCursor}`}>{tr('Nothing found')} 😔</Text>
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
                            {hasNextPage && <LoadMoreProblemsButton onClick={() => fetchNextPage()} />}
                            {isLoading && (
                                <div>
                                    <Text>{tr('Loading problems')} ⏳</Text>
                                </div>
                            )}
                        </>
                    );
                }}
            </QueryResolver>
        </Stack>
    );
};
