import { InferServerSideProps } from '../../../../types';
import { LayoutMain } from '../../../../components/layout/LayoutMain';
import { CandidateInterviewCreationForm } from '../../../../components/interviews/CandidateInterviewCreationForm';
import { ErrorWithStatus } from '../../../../utils';
import { createGetServerSideProps } from '../../../../utils/create-get-ssr-props';
import { useCandidate } from '../../../../hooks/candidate-hooks';
import { useAllowedHireStreams } from '../../../../hooks/hire-streams-hooks';
import { QueryResolver } from '../../../../components/QueryResolver';

import { tr } from './interviews.i18n';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    numberIds: { candidateId: true },
    action: async ({ ssg, session, numberIds }) => {
        await ssg.hireStreams.getAllowed.fetch();
        await ssg.candidates.getById.fetch({ candidateId: numberIds.candidateId });

        if (!(session.userRoles.admin || session.userRoles.hasHiringLeadRoles || session.userRoles.hasRecruiterRoles)) {
            throw new ErrorWithStatus(tr('No access to interview'), 403);
        }
    },
});

export default function SectionCreationPage(props: InferServerSideProps<typeof getServerSideProps>) {
    const candidateQuery = useCandidate(props.numberIds.candidateId);
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
}
