import { useRouter } from 'next/router';
import { useMemo } from 'react';

import { useCandidate, useCandidateDeleteMutation } from '../../modules/candidateHooks';
import { useCandidateInterviews } from '../../modules/interviewHooks';
import { Paths, generatePath } from '../../utils/paths';
import { Confirmation, useConfirmation } from '../Confirmation/Confirmation';
import { DropdownMenuItem } from '../TagFilterDropdown';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { CandidateView } from '../CandidateView/CandidateView';

import { tr } from './CandidatePage.i18n';

export interface CandidatePageProps {
    numberIds: Record<'candidateId', number>;
    isShowAddButton: boolean;
    canEditCandidate: boolean;
    hasAccessToDelete: boolean;
}

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
                <LayoutMain pageTitle={candidate.name} titleMenuItems={titleMenuItems}>
                    <CandidateView candidate={candidate} interviews={interviews} isShowAddButton={isShowAddButton} />
                    <Confirmation {...candidateRemoveConfirmation.props} />
                </LayoutMain>
            )}
        </QueryResolver>
    );
};

export default CandidatePage;
