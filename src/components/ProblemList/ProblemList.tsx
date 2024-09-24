import { CSSProperties } from 'react';
import { Text } from '@taskany/bricks';
import { ProblemDifficulty } from '@prisma/client';

import { useProblems } from '../../modules/problemHooks';
import { Stack } from '../Stack';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { LoadMoreProblemsButton } from '../LoadMoreProblemsButton/LoadMoreProblemsButton';
import { ProblemCard } from '../ProblemCard/ProblemCard';
import { useProblemFilterUrlParams } from '../../hooks/useProblemFilterUrlParams';

import { tr } from './ProblemList.i18n';

interface ProblemListProps {
    embedded?: boolean;
    className?: string;
    style?: CSSProperties;
    isSmallSize?: boolean;
    interviewId?: number;
    sectionId?: number;
}

export const ProblemList = ({
    className,
    style,
    embedded,
    isSmallSize,
    interviewId,
    sectionId,
}: ProblemListProps): JSX.Element => {
    const { values } = useProblemFilterUrlParams();

    const problemsQuery = useProblems({
        excludeInterviewId: interviewId,
        search: values.search,
        difficulty: values.difficulty as ProblemDifficulty[],
        tagIds: values.tag,
        authorIds: values.author,
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
                                            interviewId={interviewId}
                                            sectionId={sectionId}
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
