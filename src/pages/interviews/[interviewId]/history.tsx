import { LayoutMain } from '../../../components/layout/LayoutMain';
import { InterviewHistory } from '../../../components/interviews/InterviewHistory/InterviewHistory';
import { InferServerSideProps } from '../../../types';
import { interviewEventDbService } from '../../../backend/modules/interview-event/interview-event-db-service';
import { accessChecks } from '../../../backend/access/access-checks';
import { createGetServerSideProps } from '../../../utils/create-get-ssr-props';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    numberIds: { interviewId: true },
    action: async ({ ssg, session, numberIds, handleAccessChecks }) => {
        const interview = await ssg.interviews.getById.fetch({ interviewId: numberIds.interviewId });

        await handleAccessChecks(() => accessChecks.interview.readOne(session, interview));

        const interviewHistory = await interviewEventDbService.findWithRelations(numberIds.interviewId);

        return { interviewHistory };
    },
});

const InterviewHistoryPage = ({ interviewHistory }: InferServerSideProps<typeof getServerSideProps>) => (
    <LayoutMain pageTitle="History of changes">
        <InterviewHistory interviewHistory={interviewHistory} />
    </LayoutMain>
);

export default InterviewHistoryPage;
