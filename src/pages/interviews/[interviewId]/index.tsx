import { Interview } from '../../../controllers/Interview';
import { InferServerSideProps } from '../../../types';
import { mergeSavedValue } from '../../../components/ReactionBar/helpers';
import { rejectReasonDbService } from '../../../backend/modules/reject-reason/reject-reason-db-service';
import { accessChecks } from '../../../backend/access/access-checks';
import { createGetServerSideProps } from '../../../utils/create-get-ssr-props';
import { useInterview } from '../../../hooks/interview-hooks';
import { useSectionTypes } from '../../../hooks/section-type-hooks';
import { QueryResolver } from '../../../components/QueryResolver';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    numberIds: { interviewId: true },
    action: async ({ ssg, session, numberIds, handleAccessChecks }) => {
        const interview = await ssg.interviews.getById.fetch({ interviewId: numberIds.interviewId });
        await ssg.sectionTypes.getByHireStreamId.fetch({ hireStreamId: interview.hireStreamId });

        const rejectReasons = await rejectReasonDbService.findAll();
        const reactions = mergeSavedValue({
            currentUser: session.user,
            reactions: interview.reactions,
        });

        await handleAccessChecks(() => accessChecks.interview.readOne(session, interview));

        return { rejectReasons, reactions, hireStreamId: interview.hireStreamId };
    },
});

const InterviewPage = ({
    numberIds,
    reactions,
    rejectReasons,
    hireStreamId,
}: InferServerSideProps<typeof getServerSideProps>) => {
    const interviewQuery = useInterview(numberIds.interviewId);
    const sectionTypesQuery = useSectionTypes(hireStreamId);

    return (
        <QueryResolver queries={[interviewQuery, sectionTypesQuery]}>
            {([interview, sectionTypes]) => (
                <Interview
                    interview={interview}
                    sectionTypes={sectionTypes}
                    reactions={reactions}
                    rejectReasons={rejectReasons}
                />
            )}
        </QueryResolver>
    );
};

export default InterviewPage;
