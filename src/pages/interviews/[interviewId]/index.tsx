import { Interview } from '../../../components/Interview/Interview';
import { InferServerSideProps } from '../../../utils/types';
import { mergeSavedValue } from '../../../utils/reactions';
import { rejectReasonMethods } from '../../../modules/rejectReasonMethods';
import { accessChecks } from '../../../modules/accessChecks';
import { createGetServerSideProps } from '../../../utils/createGetSSRProps';
import { useInterview } from '../../../modules/interviewHooks';
import { useSectionTypes } from '../../../modules/sectionTypeHooks';
import { QueryResolver } from '../../../components/QueryResolver/QueryResolver';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    numberIds: { interviewId: true },
    action: async ({ ssg, session, numberIds, handleAccessChecks }) => {
        const interview = await ssg.interviews.getById.fetch({ interviewId: numberIds.interviewId });
        await ssg.sectionTypes.getByHireStreamId.fetch({ hireStreamId: interview.hireStreamId });

        const rejectReasons = await rejectReasonMethods.findAll();
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
