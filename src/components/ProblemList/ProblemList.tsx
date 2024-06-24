import { CSSProperties } from 'react';
import { Text } from '@taskany/bricks';
import { ProblemDifficulty } from '@prisma/client';

import { useProblems } from '../../modules/problemHooks';
import { parseNumber } from '../../utils/paramParsers';
import { Stack } from '../Stack';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { LoadMoreProblemsButton } from '../LoadMoreProblemsButton/LoadMoreProblemsButton';
import { ProblemCard } from '../ProblemCard/ProblemCard';
import { useQueryParamList } from '../../hooks/useQueryParamList';

import { tr } from './ProblemList.i18n';

interface ProblemListProps {
    embedded?: boolean;
    className?: string;
    style?: CSSProperties;
    isSmallSize?: boolean;
    interviewId?: number;
}

export const ProblemList = ({
    className,
    style,
    embedded,
    isSmallSize,
    interviewId,
}: ProblemListProps): JSX.Element => {
    const [getIdsFromQueryParams, { query }] = useQueryParamList();

    const sectionId = parseNumber(query.sectionId);

    const problemsQuery = useProblems({
        excludeInterviewId: interviewId,
        search: query.q as string,
        difficulty: getIdsFromQueryParams('difficulty') as ProblemDifficulty[] | undefined,
        tagIds: getIdsFromQueryParams('tag').map(Number),
        authorIds: getIdsFromQueryParams('author').map(Number),
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
