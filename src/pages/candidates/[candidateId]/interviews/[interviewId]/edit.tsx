import { InferServerSideProps } from '../../../../../utils/types';
import { LayoutMain } from '../../../../../components/LayoutMain/LayoutMain';
import { pageHrefs } from '../../../../../utils/paths';
import { CandidateInterviewUpdateForm } from '../../../../../components/CandidateInterviewUpdateForm/CandidateInterviewUpdateForm';
import { ErrorWithStatus } from '../../../../../utils';
import { accessChecks } from '../../../../../modules/accessChecks';
import { createGetServerSideProps } from '../../../../../utils/createGetSSRProps';
import { useInterview } from '../../../../../modules/interviewHooks';
import { useHireStreams } from '../../../../../modules/hireStreamsHooks';
import { QueryResolver } from '../../../../../components/QueryResolver/QueryResolver';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    numberIds: { candidateId: true, interviewId: true },
    action: async ({ session, ssg, numberIds, handleAccessChecks }) => {
        await ssg.hireStreams.getAll.fetch();
        const interview = await ssg.interviews.getById.fetch({
            interviewId: numberIds.interviewId,
        });

        if (interview.candidate.id !== numberIds.candidateId) {
            throw new ErrorWithStatus('Candidate id mismatch', 400);
        }

        await handleAccessChecks(() => accessChecks.interview.update(session, interview.hireStreamId));
    },
});

export default function SectionCreationPage(props: InferServerSideProps<typeof getServerSideProps>) {
    const interviewQuery = useInterview(props.numberIds.interviewId);
    const hireStreamsQuery = useHireStreams();

    return (
        <QueryResolver queries={[interviewQuery, hireStreamsQuery]}>
            {([interview, hireStreams]) => (
                <LayoutMain pageTitle={`"Interview" ${interview.id}`} backlink={pageHrefs.interview(interview.id)}>
                    <CandidateInterviewUpdateForm interview={interview} hireStreams={hireStreams} />
                </LayoutMain>
            )}
        </QueryResolver>
    );
}
