import { QueryResolver } from '../components/QueryResolver';
import { AddOrUpdateCandidate } from '../components/candidates/AddOrUpdateCandidate';
import { LayoutMain } from '../components/layout/LayoutMain';
import { useCandidate, useOutstaffVendors } from '../hooks/candidate-hooks';

import { tr } from './controllers.i18n';

export type CandidateEditPageProps = {
    numberIds: Record<'candidateId', number>;
};
const CandidateEditPage = ({ numberIds }: CandidateEditPageProps) => {
    const candidateQuery = useCandidate(numberIds.candidateId);
    const outstaffVendorsQuery = useOutstaffVendors();

    return (
        <LayoutMain pageTitle={tr('Candidate edit')}>
            <QueryResolver queries={[candidateQuery, outstaffVendorsQuery]}>
                {([candidate, outstaffVendors]) => (
                    <AddOrUpdateCandidate variant="update" candidate={candidate} outstaffVendors={outstaffVendors} />
                )}
            </QueryResolver>
        </LayoutMain>
    );
};

export default CandidateEditPage;
