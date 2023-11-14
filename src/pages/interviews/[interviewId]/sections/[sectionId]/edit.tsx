import { LayoutMain } from '../../../../../components/LayoutMain';
import { pageHrefs } from '../../../../../utils/paths';
import { InferServerSideProps } from '../../../../../utils/types';
import { symbols } from '../../../../../utils/symbols';
import { SectionUpdateForm } from '../../../../../components/SectionUpdateForm/SectionUpdateForm';
import { accessChecks } from '../../../../../modules/accessChecks';
import { createGetServerSideProps } from '../../../../../utils/createGetSSRProps';
import { useInterview } from '../../../../../modules/interviewHooks';
import { useSection } from '../../../../../modules/sectionHooks';
import { QueryResolver } from '../../../../../components/QueryResolver/QueryResolver';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    numberIds: { interviewId: true, sectionId: true },
    action: async ({ ssg, session, numberIds, handleAccessChecks }) => {
        await ssg.interviews.getById.fetch({ interviewId: numberIds.interviewId });
        const section = await ssg.sections.getById.fetch({ sectionId: numberIds.sectionId });

        await handleAccessChecks(() => accessChecks.section.update(session, section));

        return { sectionTypeId: section.sectionTypeId };
    },
});

const SectionPage = ({ numberIds, sectionTypeId }: InferServerSideProps<typeof getServerSideProps>) => {
    const interviewQuery = useInterview(numberIds.interviewId);
    const sectionQuery = useSection(numberIds.sectionId);

    return (
        <QueryResolver queries={[interviewQuery, sectionQuery]}>
            {([interview, section]) => {
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
                        />
                    </LayoutMain>
                );
            }}
        </QueryResolver>
    );
};
export default SectionPage;
