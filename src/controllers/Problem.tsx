import { VFC, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { gray10, textColorPrimary } from '@taskany/colors';
import { Link, Text, ArrowUpSmallIcon, ArrowDownSmallIcon } from '@taskany/bricks';

import { useProblemRemoveMutation } from '../hooks/problem-hooks';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { pageHrefs, Paths } from '../utils/paths';
import { distanceDate } from '../utils/date';
import { TagChip } from '../components/problems/TagChip';
import { LayoutMain } from '../components/layout/LayoutMain';
import { ProblemWithRelationsAndProblemSection } from '../backend/modules/problem/problem-types';
import { InlineDot } from '../components/InlineDot';
import { DropdownMenuItem } from '../components/TagFilterDropdown';
import { Confirmation, useConfirmation } from '../components/Confirmation';
import { useSession } from '../contexts/app-settings-context';
import { useProblemFilterContext } from '../contexts/problem-filter-context';
import { ProblemStats } from '../components/problems/ProblemStats';
import { accessChecks } from '../backend/access/access-checks';

import { tr } from './controllers.i18n';

type ProblemProps = {
    problem: ProblemWithRelationsAndProblemSection;
};

const StyledTagsContainer = styled.div`
    margin-bottom: 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`;

const StyledSolutionTitle = styled(Text)`
    margin-top: 50px;
    margin-bottom: 40px;
    cursor: pointer;
    align-items: center;
    gap: 5px;
`;

const StyledAuthorLink = styled.span`
    cursor: pointer;

    &:hover {
        color: ${textColorPrimary};
    }
`;

export const Problem: VFC<ProblemProps> = ({ problem }) => {
    const session = useSession();
    const router = useRouter();

    const { setTagIds, setAuthor } = useProblemFilterContext();

    const [isSolutionExpanded, setIsSolutionExpanded] = useState(false);

    const toggleSolutionExpansion = () => setIsSolutionExpanded((value) => !value);

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
                    <Text as="span" color={gray10}>
                        {tr('Created by:')}{' '}
                    </Text>
                    <StyledAuthorLink
                        onClick={() => {
                            setAuthor(problem.author);
                            router.push(Paths.PROBLEMS);
                        }}
                    >
                        <Link inline>{problem.author.name}</Link>
                    </StyledAuthorLink>{' '}
                    {distanceDate(problem.createdAt)}
                </Text>
            </Text>

            <StyledTagsContainer>
                {problem.tags.map((tag) => (
                    <TagChip
                        tag={tag}
                        key={tag.id}
                        onClick={() => {
                            setTagIds([tag.id]);
                            router.push(Paths.PROBLEMS);
                        }}
                    />
                ))}
            </StyledTagsContainer>

            <ProblemStats good={problem.solutionsGood} ok={problem.solutionsOk} bad={problem.solutionsBad} />
            <MarkdownRenderer value={problem.description} />

            <StyledSolutionTitle size="xl" onClick={toggleSolutionExpansion}>
                {tr('Solution')} {isSolutionExpanded ? <ArrowUpSmallIcon size="m" /> : <ArrowDownSmallIcon size="m" />}
            </StyledSolutionTitle>

            {isSolutionExpanded && <MarkdownRenderer value={problem.solution} />}

            <Confirmation {...problemRemoveConfirmation.props} />
        </LayoutMain>
    );
};
