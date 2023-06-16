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

type ProblemProps = {
    problem: ProblemWithRelationsAndProblemSection;
};

const StyledTagsContainer = styled.div`
    margin-bottom: 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-left: 40px;
`;

const StyledSolutionTitle = styled(Text)`
    margin-top: 50px;
    margin-bottom: 40px;
    margin-left: 40px;
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

const StyledMarkdownRenderer = styled.div`
    margin-left: 40px;
`;

export const Problem: VFC<ProblemProps> = ({ problem }) => {
    const session = useSession();
    const router = useRouter();

    const { setTagIds, setAuthor } = useProblemFilterContext();

    const [isSolutionExpanded, setIsSolutionExpanded] = useState(false);

    const toggleSolutionExpansion = () => setIsSolutionExpanded((value) => !value);

    const problemRemoveMutation = useProblemRemoveMutation();

    const problemRemoveConfirmation = useConfirmation({
        message: 'Delete problem?',
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
            items.push({ onClick: () => router.push(pageHrefs.problemEdit(problem.id)), text: 'Edit' });
            items.push({ onClick: problemRemoveConfirmation.show, text: 'Delete' });
        }

        return items;
    }, [session, problem, problemRemoveConfirmation.show, router]);

    return (
        <LayoutMain pageTitle={problem.name} headerGutter="0px" titleMenuItems={titleMenuItems}>
            <Text size="s" as="div" style={{ marginBottom: 20, marginLeft: 40 }}>
                #{problem.id}
                <Text size="s" as="span" color="textSecondary">
                    <InlineDot />
                    <Text as="span" color={gray10}>
                        Created by:{' '}
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

            <ProblemStats
                good={problem.solutionsGood}
                ok={problem.solutionsOk}
                bad={problem.solutionsBad}
                style={{ marginBottom: 50, marginLeft: 40 }}
            />
            <StyledMarkdownRenderer>
                <MarkdownRenderer value={problem.description} />
            </StyledMarkdownRenderer>

            <StyledSolutionTitle size="xl" onClick={toggleSolutionExpansion}>
                Solution{' '}
                {isSolutionExpanded ? <ArrowUpSmallIcon size="m" /> : <ArrowDownSmallIcon size="m" />}
            </StyledSolutionTitle>

            {isSolutionExpanded && (
                <StyledMarkdownRenderer>
                    {' '}
                    <MarkdownRenderer value={problem.solution} />
                </StyledMarkdownRenderer>
            )}

            <Confirmation {...problemRemoveConfirmation.props} />
        </LayoutMain>
    );
};
