import { useState, useMemo, FC } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { gray10 } from '@taskany/colors';
import { Text, nullable } from '@taskany/bricks';
import { IconArrowUpSmallOutline, IconArrowDownSmallOutline } from '@taskany/icons';

import { useProblemRemoveMutation } from '../../modules/problemHooks';
import { pageHrefs, Paths } from '../../utils/paths';
import { ProblemWithRelationsAndProblemSection } from '../../modules/problemTypes';
import { useSession } from '../../contexts/appSettingsContext';
import { accessChecks } from '../../modules/accessChecks';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
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

import { tr } from './Problem.i18n';
import s from './Problem.module.css';

interface ProblemProps {
    problem: ProblemWithRelationsAndProblemSection;
}

const StyledTagsContainer = styled.div`
    margin-bottom: 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
`;

const StyledTitle = styled(Text)`
    margin-top: 50px;
    display: flex;
    margin-bottom: 40px;
    cursor: pointer;
    align-items: center;
    gap: 5px;
`;

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
        <LayoutMain pageTitle={problem.name} headerGutter="0px" titleMenuItems={titleMenuItems}>
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
            <StyledTagsContainer>
                {problem.tags.map((tag) => (
                    <TagChip tag={tag} key={tag.id} />
                ))}

                <ProblemDifficultyIcon difficulty={problem.difficulty} />
            </StyledTagsContainer>

            <ProblemStats good={problem.solutionsGood} ok={problem.solutionsOk} bad={problem.solutionsBad} />
            <MarkdownRenderer value={problem.description} />

            <StyledTitle size="xl" onClick={toggleSolutionExpansion}>
                {tr('Solution')}{' '}
                {isSolutionExpanded ? <IconArrowUpSmallOutline size="m" /> : <IconArrowDownSmallOutline size="m" />}
            </StyledTitle>

            {isSolutionExpanded && <MarkdownRenderer value={problem.solution} />}

            <Confirmation {...problemRemoveConfirmation.props} />
            {nullable(problem.problemHistory, () => (
                <>
                    <StyledTitle size="xl" onClick={toggleProblemHistoryExpansion}>
                        {tr('History of changes')}

                        {isProblemHistoryExpanded ? (
                            <IconArrowUpSmallOutline size="m" />
                        ) : (
                            <IconArrowDownSmallOutline size="m" />
                        )}
                    </StyledTitle>
                    {isProblemHistoryExpanded && (
                        <>
                            {problem.problemHistory.map((history) => (
                                <ProblemHistoryCard key={history.id} problemHistoryChangeEvent={history} />
                            ))}
                        </>
                    )}
                </>
            ))}

            <StyledTitle size="xl">{tr('Comments')}</StyledTitle>

            <div className={s.ProblemCommentWrapper}>
                {problem.comments?.map((comment) => (
                    <Comment key={`comment - ${comment.id}`} comment={comment} />
                ))}
                <ProblemCommentCreateForm problem={problem} />
            </div>
        </LayoutMain>
    );
};
