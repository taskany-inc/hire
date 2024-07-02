import { LayoutMain } from '../../../../../components/LayoutMain/LayoutMain';
import { pageHrefs } from '../../../../../utils/paths';
import { InferServerSideProps } from '../../../../../utils/types';
import { symbols } from '../../../../../utils/symbols';
import { accessChecks } from '../../../../../modules/accessChecks';
import { createGetServerSideProps } from '../../../../../utils/createGetSSRProps';
import { useInterview } from '../../../../../modules/interviewHooks';
import { useSection } from '../../../../../modules/sectionHooks';
import { QueryResolver } from '../../../../../components/QueryResolver/QueryResolver';
import { CreateOrUpdateSectionForm } from '../../../../../components/CreateOrUpdateSectionForm/CreateOrUpdateSectionForm';

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

const SectionPage = ({ numberIds }: InferServerSideProps<typeof getServerSideProps>) => {
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
                        <CreateOrUpdateSectionForm
                            section={section}
                            sectionType={section.sectionType}
                            candidate={interview.candidate}
                            variant="update"
                            interviewId={section.interviewId}
                        />
                    </LayoutMain>
                );
            }}
        </QueryResolver>
    );
};
export default SectionPage;
