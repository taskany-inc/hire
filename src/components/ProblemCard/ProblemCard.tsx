import { FC, useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { nullable } from '@taskany/bricks';
import { gray8, textColor } from '@taskany/colors';
import { Button, Card, CardContent, CardInfo } from '@taskany/bricks/harmony';
import cn from 'classnames';
import { IconBinOutline } from '@taskany/icons';

import { ProblemWithRelationsAndProblemSection } from '../../modules/problemTypes';
import { generatePath, Paths } from '../../utils/paths';
import { useSolutionCreateMutation } from '../../modules/solutionHooks';
import { trpc } from '../../trpc/trpcClient';
import { useFavoriteProblems, useRemoveProblemFromFavoritesMutation } from '../../modules/userHooks';
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
    interviewId?: number;
    sectionId?: number;
    embedded?: boolean;
    isSmallSize?: boolean;
}

export const ProblemCard: FC<ProblemCardProps> = ({ problem, embedded, interviewId, sectionId }) => {
    const router = useRouter();
    const utils = trpc.useContext();
    const solutionCreateMutation = useSolutionCreateMutation();
    const { data: favoriteProblems } = useFavoriteProblems();
    const removeFromFavoritesMutation = useRemoveProblemFromFavoritesMutation();

    const [isSpinnerVisible, setIsSpinnerVisible] = useState(false);
    const isFavorite = useMemo(
        () => !!favoriteProblems && !!favoriteProblems.find((item) => item.id === problem.id),
        [favoriteProblems, problem.id],
    );
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

    const onBinIconClick = useCallback(async () => {
        if (isFavorite) {
            await removeFromFavoritesMutation.mutateAsync({ problemId: problem.id });
            utils.problems.getList.invalidate({ excludeInterviewId: interviewId });
        }
    }, [isFavorite, problem.id, removeFromFavoritesMutation, utils, interviewId]);

    return (
        <UnavailableContainer isUnavailable={problem.isUsed} link={renderLinkToSection()}>
            <LoadingContainer isSpinnerVisible={isSpinnerVisible}>
                <Card className={cn(s.ProblemCard, { [s.ProblemCard_archived]: problem.archived })}>
                    <CardInfo>
                        <CardHeader
                            title={
                                <div className={s.CardHeaderWrapper}>
                                    <Link
                                        className={s.Link}
                                        href={generatePath(Paths.PROBLEM, { problemId: problem.id })}
                                    >
                                        {problem.name}
                                    </Link>
                                    {nullable(
                                        problem.archived,
                                        () => (
                                            <Button
                                                view="clear"
                                                iconLeft={<IconBinOutline size="s" />}
                                                onClick={onBinIconClick}
                                            />
                                        ),
                                        <ProblemFavoriteStar isFavorite={isFavorite} problemId={problem.id} />,
                                    )}

                                    <ProblemDifficultyIcon difficulty={problem.difficulty} />
                                </div>
                            }
                            subTitle={
                                <>
                                    <div className={s.HeaderInfo_align_right}>
                                        <div className={s.TagWrapper}>
                                            {problem.tags.map((tag) => (
                                                <Link
                                                    key={tag.id}
                                                    onClick={() => problemFilter.setter('tag', [tag.id])}
                                                >
                                                    <TagChip tag={tag} />
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                    <div color={textColor}>
                                        <div>
                                            {tr('Added by')}{' '}
                                            <Link onClick={() => problemFilter.setter('author', [problem.authorId])}>
                                                {problem.author.name}{' '}
                                            </Link>{' '}
                                            {date}
                                        </div>
                                    </div>
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
                        </ExpandableContainer>

                        {nullable(isShowAddButton, () => (
                            <Button
                                className={s.ProblemCardAddToSectionButton}
                                view="default"
                                onClick={addToSection}
                                text={tr('Add')}
                            />
                        ))}
                    </CardContent>
                </Card>
            </LoadingContainer>
        </UnavailableContainer>
    );
};
