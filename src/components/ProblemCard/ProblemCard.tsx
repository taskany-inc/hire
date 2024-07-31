import { FC, useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { nullable } from '@taskany/bricks';
import { IconStarOutline, IconStarSolid } from '@taskany/icons';
import { gray8, textColor } from '@taskany/colors';
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
import { LoadingContainer } from '../LoadingContainer/LoadingContainer';
import { Card } from '../Card';
import { Link } from '../Link';
import { TagChip } from '../TagChip';
import { UnavailableContainer } from '../UnavailableContainer';
import { useDistanceDate } from '../../hooks/useDateFormat';
import { ProblemDifficultyIcon } from '../ProblemDifficultyIcon/ProblemDifficultyIcon';
import Md from '../Md';
import { CardHeader } from '../CardHeader/CardHeader';

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
        <div className={s.StarWrapper}>
            <IconStarSolid
                size="m"
                color="#FF00E5"
                onClick={() => removeFromFavoritesMutation.mutate({ problemId: problem.id })}
            />
        </div>
    ) : (
        <div className={s.StarWrapper}>
            <IconStarOutline
                stroke={0.8}
                size="m"
                color="#FF00E5"
                onClick={() => addToFavoritesMutation.mutate({ problemId: problem.id })}
            />
        </div>
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
                <Link color={gray8} href={pathToSection}>
                    {tr('Asked in the section')} {problem.problemSection?.sectionType.title}
                </Link>
            )
        );
    };

    return (
        <UnavailableContainer isUnavailable={problem.isUsed} link={renderLinkToSection()}>
            <LoadingContainer isSpinnerVisible={isSpinnerVisible}>
                <Card action={favoriteAction}>
                    {/* TODO add authorId and tagId to filter onClick */}
                    <CardHeader
                        title={problem.name}
                        link={generatePath(Paths.PROBLEM, { problemId: problem.id })}
                        subTitle={
                            <span color={textColor}>
                                {tr('Added by')} {problem.author.name} {date}
                            </span>
                        }
                        chips={
                            <div className={s.ChipWrapper}>
                                {problem.tags.map((tag) => (
                                    <TagChip tag={tag} key={tag.id} />
                                ))}
                                <ProblemDifficultyIcon difficulty={problem.difficulty} />
                            </div>
                        }
                    />
                    <div className={s.Md}>
                        {nullable(problem.description, (d) => (
                            <Md>{d}</Md>
                        ))}
                    </div>

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
