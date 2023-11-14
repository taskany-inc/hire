import { useCandidate, useOutstaffVendors } from '../../modules/candidateHooks';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { AddOrUpdateCandidate } from '../AddOrUpdateCandidate/AddOrUpdateCandidate';
import { LayoutMain } from '../LayoutMain';

import { tr } from './CandidateEditPage.i18n';

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
