import { useCandidate } from '../../modules/candidateHooks';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { AddOrUpdateCandidate } from '../AddOrUpdateCandidate/AddOrUpdateCandidate';
import { LayoutMain } from '../LayoutMain/LayoutMain';

import { tr } from './CandidateEditPage.i18n';

export interface CandidateEditPageProps {
    numberIds: Record<'candidateId', number>;
}
const CandidateEditPage = ({ numberIds }: CandidateEditPageProps) => {
    const candidateQuery = useCandidate(numberIds.candidateId);

    return (
        <LayoutMain pageTitle={tr('Candidate edit')}>
            <QueryResolver queries={[candidateQuery]}>
                {([candidate]) => <AddOrUpdateCandidate variant="update" candidate={candidate} />}
            </QueryResolver>
        </LayoutMain>
    );
};

export default CandidateEditPage;
