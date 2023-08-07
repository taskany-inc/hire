import { useRouter } from 'next/router';
import { useMemo } from 'react';

import { useCandidate, useCandidateDeleteMutation } from '../hooks/candidate-hooks';
import { useCandidateInterviews } from '../hooks/interview-hooks';
import { Confirmation, useConfirmation } from '../components/Confirmation';
import { Paths, generatePath } from '../utils/paths';
import { DropdownMenuItem } from '../components/TagFilterDropdown';
import { QueryResolver } from '../components/QueryResolver';
import { LayoutMain } from '../components/layout/LayoutMain';
import { CandidateView } from '../components/candidates/CandidateView';

import { tr } from './controllers.i18n';

export type CandidatePageProps = {
    numberIds: Record<'candidateId', number>;
    isShowAddButton: boolean;
    canEditCandidate: boolean;
    hasAccessToDelete: boolean;
};

const CandidatePage = ({ numberIds, isShowAddButton, canEditCandidate, hasAccessToDelete }: CandidatePageProps) => {
    const router = useRouter();

    const candidateQuery = useCandidate(numberIds.candidateId);
    const interviewsQuery = useCandidateInterviews(numberIds.candidateId);

    const candidateRemove = useCandidateDeleteMutation();
    const candidateRemoveConfirmation = useConfirmation({
        message: tr('Remove candidate?'),
        onAgree: () =>
            candidateRemove.mutateAsync({ candidateId: numberIds.candidateId }).then(() => {
                router.push({
                    pathname: Paths.CANDIDATES,
                });
            }),
        destructive: true,
    });

    const titleMenuItems = useMemo<DropdownMenuItem[]>(() => {
        const items: DropdownMenuItem[] = [];

        if (canEditCandidate) {
            items.push({
                onClick: () =>
                    router.push(
                        generatePath(Paths.CANDIDATE_EDIT, {
                            candidateId: numberIds.candidateId,
                        }),
                    ),
                text: tr('Edit'),
            });
        }

        if (hasAccessToDelete) {
            items.push({
                onClick: candidateRemoveConfirmation.show,
                text: tr('Remove'),
            });
        }

        return items;
    }, [canEditCandidate, hasAccessToDelete, numberIds.candidateId, candidateRemoveConfirmation.show, router]);

    return (
        <QueryResolver queries={[candidateQuery, interviewsQuery]}>
            {([candidate, interviews]) => (
                <LayoutMain pageTitle={candidate.name} titleMenuItems={titleMenuItems} headerGutter="0px">
                    <CandidateView candidate={candidate} interviews={interviews} isShowAddButton={isShowAddButton} />
                    <Confirmation {...candidateRemoveConfirmation.props} />
                </LayoutMain>
            )}
        </QueryResolver>
    );
};

export default CandidatePage;
