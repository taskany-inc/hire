import { useState, useMemo, FC } from 'react';
import { useRouter } from 'next/router';
import { gray10 } from '@taskany/colors';
import { Text, nullable } from '@taskany/bricks';
import { IconArrowUpSmallOutline, IconArrowDownSmallOutline } from '@taskany/icons';

import { useProblemRemoveMutation } from '../../modules/problemHooks';
import { pageHrefs, Paths } from '../../utils/paths';
import { ProblemWithRelationsAndProblemSection } from '../../modules/problemTypes';
import { useSession } from '../../contexts/appSettingsContext';
import { accessChecks } from '../../modules/accessChecks';
import { TagChip } from '../TagChip';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { InlineDot } from '../InlineDot';
import { DropdownMenuItem } from '../TagFilterDropdown';
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

    const problemRemoveConfirmation = useConfirmation({
        message: tr('Delete problem?'),
        onAgree: () =>
            problemRemoveMutation.mutateAsync({ problemId: problem.id }).then(() => {
                router.push(Paths.PROBLEMS);
            }),
        destructive: true,
    });

    const titleMenuItems = useMemo(() => {
        const canUpdateOrDelete = session && accessChecks.problem.updateOrDelete(session, problem).allowed;
        const items: DropdownMenuItem[] = [];

        if (canUpdateOrDelete) {
            items.push({
                onClick: () => router.push(pageHrefs.problemEdit(problem.id)),
                text: tr('Edit'),
            });
            items.push({
                onClick: problemRemoveConfirmation.show,
                text: tr('Delete'),
            });
        }

        return items;
    }, [session, problem, problemRemoveConfirmation.show, router]);

    return (
        <LayoutMain pageTitle={problem.name} titleMenuItems={titleMenuItems}>
            <Text size="s" as="div" style={{ marginBottom: 20 }}>
                #{problem.id}
                <Text size="s" as="span" color="textSecondary">
                    <InlineDot />
                    {/* TODO add authorId to filter onClick and push to Paths.PROBLEMS */}
                    <Text as="span" color={gray10}>
                        {tr('Created by:')} {problem.author.name} {date}
                    </Text>
                </Text>
            </Text>

            {/* TODO add tagId to filter onClick and push to Paths.PROBLEMS */}
            <div className={s.ProblemTagsContainer}>
                {problem.tags.map((tag) => (
                    <TagChip tag={tag} key={tag.id} />
                ))}

                <ProblemDifficultyIcon difficulty={problem.difficulty} />
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
