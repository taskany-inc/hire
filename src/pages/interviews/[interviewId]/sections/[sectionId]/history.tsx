import { SectionHistoryPage } from '../../../../../components/SectionHistoryPage/SectionHistoryPage';
import { accessChecks } from '../../../../../modules/accessChecks';
import { createGetServerSideProps } from '../../../../../utils/createGetSSRProps';
import { pageHrefs } from '../../../../../utils/paths';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    numberIds: { interviewId: true, sectionId: true },
    action: async ({ numberIds, handleAccessChecks, session, ssg }) => {
        const section = await ssg.sections.getById.fetch({ sectionId: numberIds.sectionId });

        if (section.interviewId !== numberIds.interviewId) {
            return {
                redirect: {
                    destination: pageHrefs.interviewSectionHistory(section.interviewId, section.id),
                },
            };
        }

        await handleAccessChecks(() => accessChecks.section.readOne(session, section));

        return { ...numberIds };
    },
});

export default SectionHistoryPage;
