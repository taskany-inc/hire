import { LayoutMain } from '../../../../../components/LayoutMain/LayoutMain';
import { pageHrefs } from '../../../../../utils/paths';
import { InferServerSideProps } from '../../../../../utils/types';
import { accessChecks } from '../../../../../modules/accessChecks';
import { createGetServerSideProps } from '../../../../../utils/createGetSSRProps';
import { useSectionType } from '../../../../../modules/sectionTypeHooks';
import { QueryResolver } from '../../../../../components/QueryResolver/QueryResolver';
import { useInterview } from '../../../../../modules/interviewHooks';
import { useCandidate } from '../../../../../modules/candidateHooks';
import { CreateOrUpdateSectionForm } from '../../../../../components/CreateOrUpdateSectionForm/CreateOrUpdateSectionForm';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    numberIds: { interviewId: true, typeId: true },
    action: async ({ ssg, session, numberIds, handleAccessChecks }) => {
        await ssg.sectionTypes.getById.fetch({ id: numberIds.typeId });
        const interview = await ssg.interviews.getById.fetch({ interviewId: numberIds.interviewId });

        await handleAccessChecks(() => accessChecks.section.create(session, interview.hireStreamId));

        return { candidateId: interview.candidateId };
    },
});

export default function SectionCreationPage({
    numberIds,
    candidateId,
}: InferServerSideProps<typeof getServerSideProps>) {
    const sectionTypeQuery = useSectionType(numberIds.typeId);
    const interviewQuery = useInterview(numberIds.interviewId);
    const candidateQuery = useCandidate(candidateId);

    return (
        <QueryResolver queries={[sectionTypeQuery, interviewQuery, candidateQuery]}>
            {([sectionType, interview, candidate]) => (
                <LayoutMain
                    pageTitle={`#${interview.id} — ${sectionType.title}`}
                    backlink={pageHrefs.interview(interview.id)}
                >
                    <CreateOrUpdateSectionForm
                        interviewId={interview.id}
                        sectionType={sectionType}
                        candidate={candidate}
                        interview={interview}
                        variant="new"
                    />
                </LayoutMain>
            )}
        </QueryResolver>
    );
}
