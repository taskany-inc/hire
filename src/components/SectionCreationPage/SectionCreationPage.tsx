import { useCandidate } from '../../modules/candidateHooks';
import { useAllowedHireStreams } from '../../modules/hireStreamsHooks';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { CandidateInterviewCreationForm } from '../CandidateInterviewCreationForm/CandidateInterviewCreationForm';
import { LayoutMain } from '../LayoutMain';

import { tr } from './SectionCreationPage.i18n';

export interface SectionCreationPageProps {
    numberIds: Record<'candidateId', number>;
}

const SectionCreationPage = ({ numberIds }: SectionCreationPageProps) => {
    const candidateQuery = useCandidate(numberIds.candidateId);
    const hireStreamsQuery = useAllowedHireStreams();

    return (
        <LayoutMain pageTitle={tr('New interview')}>
            <QueryResolver queries={[candidateQuery, hireStreamsQuery]}>
                {([candidate, hireStreams]) => (
                    <CandidateInterviewCreationForm candidate={candidate} hireStreams={hireStreams} />
                )}
            </QueryResolver>
        </LayoutMain>
    );
};

export default SectionCreationPage;
