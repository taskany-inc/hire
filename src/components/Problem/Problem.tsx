import { useState, useMemo, FC } from 'react';
import { useRouter } from 'next/router';
import { nullable } from '@taskany/bricks';
import { Text } from '@taskany/bricks/harmony';
import { IconArrowUpSmallOutline, IconArrowDownSmallOutline } from '@taskany/icons';

import { useProblemRemoveMutation, useProblemUpdateMutation } from '../../modules/problemHooks';
import { pageHrefs, Paths } from '../../utils/paths';
import { ProblemWithRelationsAndProblemSection } from '../../modules/problemTypes';
import { useSession } from '../../contexts/appSettingsContext';
import { accessChecks } from '../../modules/accessChecks';
import { TagChip } from '../TagChip';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { InlineDot } from '../InlineDot';
import { TitleMenuItem } from '../TitleMenu/TitleMenu';
import { Confirmation, useConfirmation } from '../Confirmation/Confirmation';
import { ProblemStats } from '../ProblemStats/ProblemStats';
import { ProblemHistoryCard } from '../ProblemHistoryCard/ProblemHistoryCard';
import { useDistanceDate } from '../../hooks/useDateFormat';
import { ProblemDifficultyIcon } from '../ProblemDifficultyIcon/ProblemDifficultyIcon';
import { Comment } from '../Comment/Comment';
import ProblemCommentCreateForm from '../ProblemCommentCreationForm/ProblemCommentCreationForm';
import Md from '../Md';

import { tr } from './Problem.i18n';
import s from './Problem.module.css';

interface ProblemProps {
    problem: ProblemWithRelationsAndProblemSection;
}

export const Problem: FC<ProblemProps> = ({ problem }) => {
    const session = useSession();
    const router = useRouter();
    const date = useDistanceDate(problem.createdAt);

    const [isSolutionExpanded, setIsSolutionExpanded] = useState(false);
    const [isProblemHistoryExpanded, setIsProblemHistoryExpanded] = useState(false);

    const toggleSolutionExpansion = () => setIsSolutionExpanded((value) => !value);
    const toggleProblemHistoryExpansion = () => setIsProblemHistoryExpanded((value) => !value);

    const problemRemoveMutation = useProblemRemoveMutation();
    const problemUpdateMutation = useProblemUpdateMutation();

    const problemRemoveConfirmation = useConfirmation({
        message: tr('Delete problem?'),
        onAgree: () =>
            problemRemoveMutation.mutateAsync({ problemId: problem.id }).then(() => {
                router.push(Paths.PROBLEMS);
            }),
        destructive: true,
    });

    const problemArchiveConfirmation = useConfirmation({
        message: problem.archived ? tr('Remove problem from archive?') : tr('Archive problem?'),
        onAgree: () =>
            problemUpdateMutation
                .mutateAsync({
                    problemId: problem.id,
                    archived: !problem.archived,
                })
                .then(() => {
                    router.push(Paths.PROBLEMS);
                }),
        destructive: true,
    });

    const titleMenuItems = useMemo(() => {
        const canUpdateOrDelete = session && accessChecks.problem.updateOrDelete(session, problem).allowed;
        const items: TitleMenuItem[] = [];

        if (canUpdateOrDelete) {
            items.push({
                onClick: () => router.push(pageHrefs.problemEdit(problem.id)),
                text: tr('Edit'),
            });
            items.push({
                onClick: problemArchiveConfirmation.show,
                text: problem.archived ? tr('Remove from archive') : tr('Archive'),
            });
            items.push({
                onClick: problemRemoveConfirmation.show,
                text: tr('Delete'),
            });
        }

        return items;
    }, [session, problem, problemRemoveConfirmation.show, router, problemArchiveConfirmation.show]);

    return (
        <LayoutMain pageTitle={problem.name} titleMenuItems={titleMenuItems}>
            <div className={s.ProblemInfoLine}>
                <Text size="s">#{problem.id}</Text>
                <InlineDot />
                {/* TODO add authorId to filter onClick and push to Paths.PROBLEMS */}
                <Text>
                    {tr('Created by:')} {problem.author.name} {date}
                </Text>
                <ProblemDifficultyIcon difficulty={problem.difficulty} />
                {problem.tags.map((tag) => (
                    <TagChip tag={tag} key={tag.id} />
                ))}
            </div>

            <ProblemStats good={problem.solutionsGood} ok={problem.solutionsOk} bad={problem.solutionsBad} />

            {nullable(problem.description, (d) => (
                <Md className={s.ProblemMdWrapper}>{d}</Md>
            ))}

            <Text size="xl" onClick={toggleSolutionExpansion} className={s.ProblemTitle}>
                {tr('Solution')}{' '}
                {isSolutionExpanded ? <IconArrowUpSmallOutline size="m" /> : <IconArrowDownSmallOutline size="m" />}
            </Text>

            {nullable(isSolutionExpanded && problem.solution, (d) => (
                <Md className={s.ProblemMdWrapper}>{d}</Md>
            ))}
            <Confirmation {...problemRemoveConfirmation.props} />
            <Confirmation {...problemArchiveConfirmation.props} />
            {nullable(problem.problemHistory, () => (
                <>
                    <Text size="xl" onClick={toggleProblemHistoryExpansion} className={s.ProblemTitle}>
                        {tr('History of changes')}

                        {isProblemHistoryExpanded ? (
                            <IconArrowUpSmallOutline size="m" />
                        ) : (
                            <IconArrowDownSmallOutline size="m" />
                        )}
                    </Text>
                    {isProblemHistoryExpanded && (
                        <>
                            {problem.problemHistory.map((history) => (
                                <ProblemHistoryCard key={history.id} problemHistoryChangeEvent={history} />
                            ))}
                        </>
                    )}
                </>
            ))}

            <Text size="xl" className={s.ProblemTitle}>
                {tr('Comments')}
            </Text>

            <div className={s.ProblemCommentWrapper}>
                {problem.comments?.map((comment) => (
                    <Comment key={`comment - ${comment.id}`} comment={comment} />
                ))}
                <ProblemCommentCreateForm problem={problem} />
            </div>
        </LayoutMain>
    );
};
