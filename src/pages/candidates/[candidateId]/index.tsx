import { candidateMethods } from '../../../modules/candidateMethods';
import { accessChecks } from '../../../modules/accessChecks';
import { createGetServerSideProps } from '../../../utils/createGetSSRProps';
import CandidatePage from '../../../components/CandidatePage/CandidatePage';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    numberIds: { candidateId: true },
    action: async ({ session, ssg, numberIds, handleAccessChecks }) => {
        await ssg.candidates.getById.fetch({ candidateId: numberIds.candidateId });
        const candidateWithRelations = await candidateMethods.getByIdWithRelations(numberIds.candidateId);

        const candidateAccessCheck = accessChecks.candidate.readOne(session, candidateWithRelations);
        const interviews = await ssg.interviews.getListByCandidateId.fetch({
            candidateId: numberIds.candidateId,
        });

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

export default CandidatePage;
