import { accessChecks } from '../../../modules/accessChecks';
import { createGetServerSideProps } from '../../../utils/createGetSSRProps';
import InterviewHistoryPage from '../../../components/InterviewHistoryPage/InterviewHistoryPage';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    numberIds: { interviewId: true },
    action: async ({ ssg, session, numberIds, handleAccessChecks }) => {
        const interview = await ssg.interviews.getById.fetch({
            interviewId: numberIds.interviewId,
        });

        await handleAccessChecks(() => accessChecks.interview.readOne(session, interview));

        return { interviewId: numberIds.interviewId };
    },
});

export default InterviewHistoryPage;
