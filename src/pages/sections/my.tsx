import { sectionMethods } from '../../modules/sectionMethods';
import { createGetServerSideProps } from '../../utils/createGetSSRProps';
import MyInterviewsPage from '../../components/MyInterviewsPage/MyInterviewsPage';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ session }) => {
        const completedSections = await sectionMethods.findAllInterviewerSections(session.user.id, true);
        const onGoingSections = await sectionMethods.findAllInterviewerSections(session.user.id, false);

        return { completedSections, onGoingSections };
    },
});

export default MyInterviewsPage;
