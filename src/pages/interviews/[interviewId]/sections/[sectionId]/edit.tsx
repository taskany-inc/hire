import { LayoutMain } from '../../../../../components/layout/LayoutMain';
import { pageHrefs } from '../../../../../utils/paths';
import { InferServerSideProps } from '../../../../../types';
import { symbols } from '../../../../../utils/symbols';
import { SectionUpdateForm } from '../../../../../components/sections/SectionUpdateForm';
import { accessChecks } from '../../../../../backend/access/access-checks';
import { createGetServerSideProps } from '../../../../../utils/create-get-ssr-props';
import { useInterview } from '../../../../../hooks/interview-hooks';
import { useSection } from '../../../../../hooks/section-hooks';
import { useSectionTypeInterviewers } from '../../../../../hooks/section-type-hooks';
import { QueryResolver } from '../../../../../components/QueryResolver';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    numberIds: { interviewId: true, sectionId: true },
    action: async ({ ssg, session, numberIds, handleAccessChecks }) => {
        await ssg.interviews.getById.fetch({ interviewId: numberIds.interviewId });
        const section = await ssg.sections.getById.fetch({ sectionId: numberIds.sectionId });
        await ssg.sectionTypes.getInterviewers.fetch({ sectionTypeId: section.sectionTypeId });

        await handleAccessChecks(() => accessChecks.section.update(session, section));

        return { sectionTypeId: section.sectionTypeId };
    },
});

const SectionPage = ({ numberIds, sectionTypeId }: InferServerSideProps<typeof getServerSideProps>) => {
    const interviewQuery = useInterview(numberIds.interviewId);
    const sectionQuery = useSection(numberIds.sectionId);
    const interviewersQuery = useSectionTypeInterviewers(sectionTypeId);

    return (
        <QueryResolver queries={[interviewQuery, sectionQuery, interviewersQuery]}>
            {([interview, section, interviewers]) => {
                const pageTitle = `#${interview.id} ${symbols.emDash} ${section.sectionType.title}`;

                return (
                    <LayoutMain
                        pageTitle={pageTitle}
                        backlink={pageHrefs.interviewSectionView(interview.id, section.id)}
                    >
                        <SectionUpdateForm
                            section={section}
                            sectionType={section.sectionType}
                            candidate={interview.candidate}
                            interviewers={interviewers}
                        />
                    </LayoutMain>
                );
            }}
        </QueryResolver>
    );
};
export default SectionPage;
