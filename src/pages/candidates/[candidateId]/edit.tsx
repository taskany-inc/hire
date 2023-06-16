import { AddOrUpdateCandidate } from '../../../components/candidates/AddOrUpdateCandidate';
import { LayoutMain } from '../../../components/layout/LayoutMain';
import { candidateDbService } from '../../../backend/modules/candidate/candidate-db-service';
import { accessChecks } from '../../../backend/access/access-checks';
import { createGetServerSideProps } from '../../../utils/create-get-ssr-props';
import { InferServerSideProps } from '../../../types';
import { useCandidate, useOutstaffVendors } from '../../../hooks/candidate-hooks';
import { QueryResolver } from '../../../components/QueryResolver';

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

const NewCandidatePage = ({ numberIds }: InferServerSideProps<typeof getServerSideProps>) => {
    const candidateQuery = useCandidate(numberIds.candidateId);
    const outstaffVendorsQuery = useOutstaffVendors();

    return (
        <LayoutMain pageTitle="Candidate edit">
            <QueryResolver queries={[candidateQuery, outstaffVendorsQuery]}>
                {([candidate, outstaffVendors]) => (
                    <AddOrUpdateCandidate variant="update" candidate={candidate} outstaffVendors={outstaffVendors} />
                )}
            </QueryResolver>
        </LayoutMain>
    );
};

export default NewCandidatePage;
