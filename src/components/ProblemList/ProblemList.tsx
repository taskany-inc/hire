import { useRouter } from 'next/router';
import { CSSProperties } from 'react';
import { Text } from '@taskany/bricks';

import { useProblemFilterContext } from '../../contexts/problemFilterContext';
import { useProblems } from '../../modules/problemHooks';
import { parseNumber } from '../../utils/paramParsers';
import { Stack } from '../Stack';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { LoadMoreProblemsButton } from '../LoadMoreProblemsButton/LoadMoreProblemsButton';
import { ProblemCard } from '../ProblemCard/ProblemCard';

import { tr } from './ProblemList.i18n';

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
