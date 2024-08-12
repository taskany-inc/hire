import { Interview } from '../../../components/Interview/Interview';
import { InferServerSideProps } from '../../../utils/types';
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
        if (interview.crewVacancyId) {
            await ssg.crew.getVacancyById.fetch(interview.crewVacancyId);
        }
        await ssg.sectionTypes.getByHireStreamId.fetch({ hireStreamId: interview.hireStreamId });

        await handleAccessChecks(() => accessChecks.interview.readOne(session, interview));

        return { hireStreamId: interview.hireStreamId };
    },
});

const InterviewPage = ({ numberIds, hireStreamId }: InferServerSideProps<typeof getServerSideProps>) => {
    const interviewQuery = useInterview(numberIds.interviewId);
    const sectionTypesQuery = useSectionTypes(hireStreamId);

    return (
        <QueryResolver queries={[interviewQuery, sectionTypesQuery]}>
            {([interview, sectionTypes]) => <Interview interview={interview} sectionTypes={sectionTypes} />}
        </QueryResolver>
    );
};

export default InterviewPage;
