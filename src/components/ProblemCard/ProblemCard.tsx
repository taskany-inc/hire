import { useCallback, useMemo, useState, VFC } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { textColor, link0, gray8 } from '@taskany/colors';
import { IconStarOutline, IconStarSolid } from '@taskany/icons';
import { Button } from '@taskany/bricks/harmony';

import { ProblemWithRelationsAndProblemSection } from '../../modules/problemTypes';
import { generatePath, Paths } from '../../utils/paths';
import { useSolutionCreateMutation } from '../../modules/solutionHooks';
import { parseNumber } from '../../utils/paramParsers';
import { trpc } from '../../trpc/trpcClient';
import {
    useAddProblemToFavoritesMutation,
    useFavoriteProblems,
    useRemoveProblemFromFavoritesMutation,
} from '../../modules/userHooks';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
import { LoadingContainer } from '../LoadingContainer';
import { Card } from '../Card/Card';
import { CardContent } from '../CardContent';
import { CardHeader } from '../CardHeader';
import { Link } from '../Link';
import { TagChip } from '../TagChip';
import { UnavailableContainer } from '../UnavailableContainer';
import { useDistanceDate } from '../../hooks/useDateFormat';
import { ProblemDifficultyIcon } from '../ProblemDifficultyIcon/ProblemDifficultyIcon';

import { tr } from './ProblemCard.i18n';
import s from './ProblemCard.module.css';

const StyledMarkdownRenderer = styled(MarkdownRenderer)<{
    isSmallSize?: boolean;
}>`
    margin-top: 14px;
    overflow: auto;
`;

const StyledCardHeader = styled(CardHeader)<{
    isSmallSize?: boolean;
}>`
    max-width: ${({ isSmallSize }) => isSmallSize && '630px'};
`;
const StyledAuthor = styled.span`
    color: ${textColor};
`;

const StyledLink = styled(Link)`
    font-size: 24px;
    color: ${gray8};

    &:hover {
        color: ${link0};
    }
`;

const IconStarWrapper = styled.div`
    margin-top: -6px;
`;

const StyledChipWrapper = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
`;

export interface ProblemCardProps {
    problem: ProblemWithRelationsAndProblemSection;
    embedded?: boolean;
    isSmallSize?: boolean;
}

export const ProblemCard: VFC<ProblemCardProps> = ({ problem, embedded, isSmallSize }) => {
    const router = useRouter();
    const utils = trpc.useContext();
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

    const date = useDistanceDate(problem.createdAt);

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
        <IconStarWrapper>
            <IconStarSolid
                size="m"
                color="#FF00E5"
                onClick={() => removeFromFavoritesMutation.mutate({ problemId: problem.id })}
            />
        </IconStarWrapper>
    ) : (
        <IconStarWrapper>
            <IconStarOutline
                stroke={0.8}
                size="m"
                color="#FF00E5"
                onClick={() => addToFavoritesMutation.mutate({ problemId: problem.id })}
            />
        </IconStarWrapper>
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
                    {/* TODO add authorId and tagId to filter onClick */}
                    <StyledCardHeader
                        title={problem.name}
                        isSmallSize={isSmallSize}
                        link={generatePath(Paths.PROBLEM, { problemId: problem.id })}
                        subTitle={
                            <StyledAuthor>
                                {tr('Added by')} {problem.author.name} {date}
                            </StyledAuthor>
                        }
                        chips={
                            <StyledChipWrapper>
                                {problem.tags.map((tag) => (
                                    <TagChip tag={tag} key={tag.id} />
                                ))}
                                <ProblemDifficultyIcon difficulty={problem.difficulty} />
                            </StyledChipWrapper>
                        }
                    />

                    <CardContent>
                        <StyledMarkdownRenderer isSmallSize={isSmallSize} value={problem.description} />
                    </CardContent>

                    {isShowAddButton && (
                        <Button
                            className={s.ProblemCardAddToSectionButton}
                            view="primary"
                            onClick={addToSection}
                            text={tr('Add')}
                        />
                    )}
                </Card>
            </LoadingContainer>
        </UnavailableContainer>
    );
};
