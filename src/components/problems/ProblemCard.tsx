import { useCallback, useMemo, useState, VFC } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { textColor, link0 } from '@taskany/colors';
import { Button, Link, StarFilledIcon, StarIcon } from '@taskany/bricks';

import { ProblemWithRelationsAndProblemSection } from '../../backend/modules/problem/problem-types';
import { distanceDate } from '../../utils/date';
import { problemDifficultyLabels } from '../../utils/dictionaries';
import { generatePath, Paths } from '../../utils/paths';
import {
    useAddProblemToFavoritesMutation,
    useFavoriteProblems,
    useRemoveProblemFromFavoritesMutation,
} from '../../hooks/user-hooks';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { useSolutionCreateMutation } from '../../hooks/solution-hooks';
import { useProblemFilterContext } from '../../contexts/problem-filter-context';
import { LoadingContainer } from '../LoadingContainer';
import { Card } from '../card/Card';
import { CardContent } from '../card/CardContent';
import { CardFooter } from '../card/CardFooter';
import { CardHeader } from '../card/CardHeader';
import { parseNumber } from '../../utils/param-parsers';
import { trpc } from '../../utils/trpc-front';

import { TagChip } from './TagChip';
import { UnavailableContainer } from './UnavailableContainer';
import { tr } from './problems.i18n';

const StyledStarFilledIcon = styled(StarFilledIcon)`
    display: inline-block;
    margin-top: -3px;
`;

const StyledStarIcon = styled(StarIcon)`
    display: inline-block;
    margin-top: -3px;
`;

const StyledMarkdownRenderer = styled(MarkdownRenderer)<{
    isSmallSize?: boolean;
}>`
    margin-top: 14px;
    overflow: auto;
    max-width: ${({ isSmallSize }) => (isSmallSize ? '700px' : '900px')};
`;

const StyledAddButton = styled(Button)`
    margin-top: 10px;
`;

const StyledAuthor = styled.span`
    color: ${textColor};
`;

const StyledAuthorLink = styled.span`
    cursor: pointer;

    &:hover {
        color: ${link0};
    }
`;

const StyledLink = styled(Link)`
    font-size: 24px;
    color: ${textColor};

    &:hover {
        color: ${link0};
    }
`;

export type ProblemCardProps = {
    problem: ProblemWithRelationsAndProblemSection;
    embedded?: boolean;
    isSmallSize?: boolean;
};

export const ProblemCard: VFC<ProblemCardProps> = ({ problem, embedded, isSmallSize }) => {
    const router = useRouter();
    const utils = trpc.useContext();
    const { setAuthor, setTagIds } = useProblemFilterContext();
    const addToFavoritesMutation = useAddProblemToFavoritesMutation();
    const removeFromFavoritesMutation = useRemoveProblemFromFavoritesMutation();
    const solutionCreateMutation = useSolutionCreateMutation();
    const { data: favoriteProblems } = useFavoriteProblems();
    const [isSpinnerVisible, setIsSpinnerVisible] = useState(false);
    const isFavorite = useMemo(
        () => favoriteProblems && !!favoriteProblems.find((item) => item.id === problem.id),
        [favoriteProblems, problem.id],
    );
    const interviewId = parseNumber(router.query.interviewId);
    const sectionId = parseNumber(router.query.sectionId);

    const addToSection = useCallback(async () => {
        if (sectionId) {
            setIsSpinnerVisible(true);
            try {
                await solutionCreateMutation.mutateAsync({
                    problemId: problem.id,
                    sectionId,
                });
                utils.problems.getList.invalidate({ excludeInterviewId: interviewId });
                router.replace(router.asPath);
            } finally {
                setIsSpinnerVisible(false);
            }
        }
    }, [sectionId, solutionCreateMutation, problem.id, utils, interviewId, router]);

    const favoriteAction = isFavorite ? (
        <StyledStarFilledIcon
            size="m"
            color="#FF00E5"
            onClick={() => removeFromFavoritesMutation.mutate({ problemId: problem.id })}
        />
    ) : (
        <StyledStarIcon
            stroke={0.8}
            size="m"
            color="#FF00E5"
            onClick={() => addToFavoritesMutation.mutate({ problemId: problem.id })}
        />
    );

    const isShowAddButton = !problem.isUsed && embedded;

    const renderLinkToSection = () => {
        const pathToSection =
            interviewId && sectionId
                ? generatePath(Paths.SECTION, {
                      interviewId,
                      sectionId: problem.problemSection?.sectionId ?? 0,
                  })
                : '';

        return (
            pathToSection && (
                <StyledLink href={pathToSection}>
                    {tr('Asked in the section')} {problem.problemSection?.sectionType.title}
                </StyledLink>
            )
        );
    };

    return (
        <UnavailableContainer isUnavailable={problem.isUsed} link={renderLinkToSection()}>
            <LoadingContainer isSpinnerVisible={isSpinnerVisible}>
                <Card action={favoriteAction}>
                    <CardHeader
                        title={problem.name}
                        link={generatePath(Paths.PROBLEM, { problemId: problem.id })}
                        subTitle={
                            <StyledAuthor>
                                {tr('Added by')}{' '}
                                <StyledAuthorLink onClick={() => setAuthor(problem.author)}>
                                    {problem.author.name}
                                </StyledAuthorLink>{' '}
                                {distanceDate(problem.createdAt)}
                            </StyledAuthor>
                        }
                        chips={problem.tags.map((tag) => (
                            <TagChip tag={tag} onClick={() => setTagIds([tag.id])} key={tag.id} />
                        ))}
                    />

                    <CardContent>
                        <StyledMarkdownRenderer isSmallSize={isSmallSize} value={problem.description} />
                    </CardContent>

                    <CardFooter>
                        {tr('Difficulty:')} {problemDifficultyLabels[problem.difficulty]}
                    </CardFooter>

                    {isShowAddButton && <StyledAddButton view="primary" onClick={addToSection} text={tr('Add')} />}
                </Card>
            </LoadingContainer>
        </UnavailableContainer>
    );
};
