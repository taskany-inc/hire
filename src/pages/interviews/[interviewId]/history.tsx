import { interviewEventDbService } from '../../../backend/modules/interview-event/interview-event-db-service';
import { accessChecks } from '../../../backend/access/access-checks';
import { createGetServerSideProps } from '../../../utils/create-get-ssr-props';
import InterviewHistoryPage from '../../../controllers/InterviewHistoryPage';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    numberIds: { interviewId: true },
    action: async ({ ssg, session, numberIds, handleAccessChecks }) => {
        const interview = await ssg.interviews.getById.fetch({
            interviewId: numberIds.interviewId,
        });

        await handleAccessChecks(() => accessChecks.interview.readOne(session, interview));

        const interviewHistory = await interviewEventDbService.findWithRelations(numberIds.interviewId);

        return { interviewHistory };
    },
});

export default InterviewHistoryPage;
