import { InferServerSideProps } from "../../../../../types";
import { LayoutMain } from "../../../../../components/layout/LayoutMain";
import { pageHrefs } from "../../../../../utils/paths";
import { CandidateInterviewUpdateForm } from "../../../../../components/interviews/CandidateInterviewUpdateForm";
import { ErrorWithStatus } from "../../../../../utils";
import { accessChecks } from "../../../../../backend/access/access-checks";
import { createGetServerSideProps } from "../../../../../utils/create-get-ssr-props";
import { useInterview } from "../../../../../hooks/interview-hooks";
import { useHireStreams } from "../../../../../hooks/hire-streams-hooks";
import { QueryResolver } from "../../../../../components/QueryResolver";

import { tr } from './[interviewId].i18n';

export const getServerSideProps = createGetServerSideProps({
  requireSession: true,
  numberIds: { candidateId: true, interviewId: true },
  action: async ({ session, ssg, numberIds, handleAccessChecks }) => {
    await ssg.hireStreams.getAll.fetch();
    const interview = await ssg.interviews.getById.fetch({
      interviewId: numberIds.interviewId,
    });

    if (interview.candidate.id !== numberIds.candidateId) {
      throw new ErrorWithStatus(tr("Candidate id mismatch"), 400);
    }

    await handleAccessChecks(() =>
      accessChecks.interview.update(session, interview.hireStreamId)
    );
  },
});

export default function SectionCreationPage(
  props: InferServerSideProps<typeof getServerSideProps>
) {
  const interviewQuery = useInterview(props.numberIds.interviewId);
  const hireStreamsQuery = useHireStreams();

  return (
    <QueryResolver queries={[interviewQuery, hireStreamsQuery]}>
      {([interview, hireStreams]) => (
        <LayoutMain
          pageTitle={`${tr("Interview #")}${interview.id}`}
          backlink={pageHrefs.interview(interview.id)}
        >
          <CandidateInterviewUpdateForm
            interview={interview}
            hireStreams={hireStreams}
          />
        </LayoutMain>
      )}
    </QueryResolver>
  );
}
