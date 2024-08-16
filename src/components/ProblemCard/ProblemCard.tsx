import { FC, useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { nullable } from '@taskany/bricks';
import { gray8, textColor } from '@taskany/colors';
import { Button, Card, CardContent, CardInfo } from '@taskany/bricks/harmony';

import { ProblemWithRelationsAndProblemSection } from '../../modules/problemTypes';
import { generatePath, Paths } from '../../utils/paths';
import { useSolutionCreateMutation } from '../../modules/solutionHooks';
import { parseNumber } from '../../utils/paramParsers';
import { trpc } from '../../trpc/trpcClient';
import { useFavoriteProblems } from '../../modules/userHooks';
import { LoadingContainer } from '../LoadingContainer/LoadingContainer';
import { Link } from '../Link';
import { TagChip } from '../TagChip';
import { UnavailableContainer } from '../UnavailableContainer';
import { useDistanceDate } from '../../hooks/useDateFormat';
import { ProblemDifficultyIcon } from '../ProblemDifficultyIcon/ProblemDifficultyIcon';
import Md from '../Md';
import { CardHeader } from '../CardHeader/CardHeader';
import { ProblemFavoriteStar } from '../ProblemFavoriteStar/ProblemFavoriteStar';
import { useProblemFilterUrlParams } from '../../hooks/useProblemFilterUrlParams';
import { ExpandableContainer } from '../ExpandableContainer/ExpandableContainer';

import { tr } from './ProblemCard.i18n';
import s from './ProblemCard.module.css';

export interface ProblemCardProps {
    problem: ProblemWithRelationsAndProblemSection;
    embedded?: boolean;
    isSmallSize?: boolean;
}

export const ProblemCard: FC<ProblemCardProps> = ({ problem, embedded }) => {
    const router = useRouter();
    const utils = trpc.useContext();
    const solutionCreateMutation = useSolutionCreateMutation();
    const { data: favoriteProblems } = useFavoriteProblems();
    const [isSpinnerVisible, setIsSpinnerVisible] = useState(false);
    const isFavorite = useMemo(
        () => !!favoriteProblems && !!favoriteProblems.find((item) => item.id === problem.id),
        [favoriteProblems, problem.id],
    );
    const interviewId = parseNumber(router.query.interviewId);
    const sectionId = parseNumber(router.query.sectionId);
    const problemFilter = useProblemFilterUrlParams();

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
                <Link color={gray8} href={pathToSection}>
                    {tr('Asked in the section')} {problem.problemSection?.sectionType.title}
                </Link>
            )
        );
    };

    return (
        <UnavailableContainer isUnavailable={problem.isUsed} link={renderLinkToSection()}>
            <LoadingContainer isSpinnerVisible={isSpinnerVisible}>
                <Card className={s.ProblemCard}>
                    <CardInfo>
                        <CardHeader
                            title={
                                <>
                                    <Link href={generatePath(Paths.PROBLEM, { problemId: problem.id })}>
                                        {problem.name}
                                    </Link>
                                    <ProblemFavoriteStar isFavorite={isFavorite} problemId={problem.id} />
                                </>
                            }
                            subTitle={
                                <span color={textColor}>
                                    {tr('Added by')}{' '}
                                    <Link onClick={() => problemFilter.setter('author', [problem.authorId])}>
                                        {problem.author.name}
                                    </Link>{' '}
                                    {date}
                                </span>
                            }
                            chips={
                                <>
                                    <ProblemDifficultyIcon difficulty={problem.difficulty} />
                                    {problem.tags.map((tag) => (
                                        <Link key={tag.id} onClick={() => problemFilter.setter('tag', [tag.id])}>
                                            <TagChip tag={tag} />
                                        </Link>
                                    ))}
                                </>
                            }
                            className={s.ProblemCardHeader}
                        />
                    </CardInfo>

                    <CardContent className={s.ProblemCardContent}>
                        <ExpandableContainer>
                            {nullable(problem.description, (d) => (
                                <Md>{d}</Md>
                            ))}

                            {isShowAddButton && (
                                <Button
                                    className={s.ProblemCardAddToSectionButton}
                                    view="primary"
                                    onClick={addToSection}
                                    text={tr('Add')}
                                />
                            )}
                        </ExpandableContainer>
                    </CardContent>
                </Card>
            </LoadingContainer>
        </UnavailableContainer>
    );
};
