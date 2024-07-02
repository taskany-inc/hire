import { useCandidate } from '../../modules/candidateHooks';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { CandidateInterviewCreationForm } from '../CandidateInterviewCreationForm/CandidateInterviewCreationForm';
import { LayoutMain } from '../LayoutMain/LayoutMain';

import { tr } from './SectionCreationPage.i18n';

export interface SectionCreationPageProps {
    numberIds: Record<'candidateId', number>;
}

const SectionCreationPage = ({ numberIds }: SectionCreationPageProps) => {
    const candidateQuery = useCandidate(numberIds.candidateId);

    return (
        <LayoutMain pageTitle={tr('New interview')}>
            <QueryResolver queries={[candidateQuery]}>
                {([candidate]) => <CandidateInterviewCreationForm candidate={candidate} />}
            </QueryResolver>
        </LayoutMain>
    );
};

export default SectionCreationPage;
