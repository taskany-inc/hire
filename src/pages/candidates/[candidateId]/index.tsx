import { useMemo } from 'react';
import { useRouter } from 'next/router';

import { candidateDbService } from '../../../backend/modules/candidate/candidate-db-service';
import { LayoutMain } from '../../../components/layout/LayoutMain';
import { generatePath, Paths } from '../../../utils/paths';
import { InferServerSideProps } from '../../../types';
import { CandidateView } from '../../../components/candidates/CandidateView';
import { accessChecks } from '../../../backend/access/access-checks';
import { Confirmation, useConfirmation } from '../../../components/Confirmation';
import { useCandidate, useCandidateDeleteMutation } from '../../../hooks/candidate-hooks';
import { createGetServerSideProps } from '../../../utils/create-get-ssr-props';
import { QueryResolver } from '../../../components/QueryResolver';
import { useCandidateInterviews } from '../../../hooks/interview-hooks';
import { DropdownMenuItem } from '../../../components/TagFilterDropdown';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    numberIds: { candidateId: true },
    action: async ({ session, ssg, numberIds, handleAccessChecks }) => {
        await ssg.candidates.getById.fetch({ candidateId: numberIds.candidateId });
        const candidateWithRelations = await candidateDbService.getByIdWithRelations(numberIds.candidateId);

        const candidateAccessCheck = accessChecks.candidate.readOne(session, candidateWithRelations);
        const interviews = await ssg.interviews.getListByCandidateId.fetch({ candidateId: numberIds.candidateId });

        await handleAccessChecks(() => candidateAccessCheck);

        const isShowAddButton =
            session.userRoles.admin || session.userRoles.hasHiringLeadRoles || session.userRoles.hasRecruiterRoles;
        const canEditCandidate = accessChecks.candidate.update(session, candidateWithRelations).allowed;
        const hasAccessToDelete =
            session &&
            accessChecks.candidate.delete(session, candidateWithRelations).allowed &&
            interviews.length === 0;

        return { isShowAddButton, canEditCandidate, hasAccessToDelete };
    },
});

const CandidatePage = ({
    numberIds,
    isShowAddButton,
    canEditCandidate,
    hasAccessToDelete,
}: InferServerSideProps<typeof getServerSideProps>) => {
    const router = useRouter();

    const candidateQuery = useCandidate(numberIds.candidateId);
    const interviewsQuery = useCandidateInterviews(numberIds.candidateId);

    const candidateRemove = useCandidateDeleteMutation();
    const candidateRemoveConfirmation = useConfirmation({
        message: 'Remove candidate?',
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
                onClick: () => router.push(generatePath(Paths.CANDIDATE_EDIT, { candidateId: numberIds.candidateId })),
                text: 'Edit',
            });
        }

        if (hasAccessToDelete) {
            items.push({
                onClick: candidateRemoveConfirmation.show,
                text: 'Remove',
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
