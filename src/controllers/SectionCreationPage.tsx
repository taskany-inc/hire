import { QueryResolver } from '../components/QueryResolver';
import { CandidateInterviewCreationForm } from '../components/interviews/CandidateInterviewCreationForm';
import { LayoutMain } from '../components/layout/LayoutMain';
import { useCandidate } from '../hooks/candidate-hooks';
import { useAllowedHireStreams } from '../hooks/hire-streams-hooks';

import { tr } from './controllers.i18n';

export type SectionCreationPageProps = {
    numberIds: Record<'candidateId', number>;
};

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
