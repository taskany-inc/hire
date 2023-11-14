import { candidateMethods } from '../../../modules/candidateMethods';
import { accessChecks } from '../../../modules/accessChecks';
import { createGetServerSideProps } from '../../../utils/createGetSSRProps';
import CandidateEditPage from '../../../components/CandidateEditPage/CandidateEditPage';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    numberIds: { candidateId: true },
    action: async ({ ssg, session, numberIds, handleAccessChecks }) => {
        await ssg.candidates.getOutstaffVendors.fetch();
        await ssg.candidates.getById.fetch({ candidateId: numberIds.candidateId });
        const candidateWithRelations = await candidateMethods.getByIdWithRelations(numberIds.candidateId);

        await handleAccessChecks(() => accessChecks.candidate.update(session, candidateWithRelations));
    },
});

export default CandidateEditPage;
