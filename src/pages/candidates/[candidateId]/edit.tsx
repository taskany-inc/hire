import { candidateDbService } from '../../../backend/modules/candidate/candidate-db-service';
import { accessChecks } from '../../../backend/access/access-checks';
import { createGetServerSideProps } from '../../../utils/create-get-ssr-props';
import CandidateEditPage from '../../../controllers/CandidateEditPage';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    numberIds: { candidateId: true },
    action: async ({ ssg, session, numberIds, handleAccessChecks }) => {
        await ssg.candidates.getOutstaffVendors.fetch();
        await ssg.candidates.getById.fetch({ candidateId: numberIds.candidateId });
        const candidateWithRelations = await candidateDbService.getByIdWithRelations(numberIds.candidateId);

        await handleAccessChecks(() => accessChecks.candidate.update(session, candidateWithRelations));
    },
});

export default CandidateEditPage;
