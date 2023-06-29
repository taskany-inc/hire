import { sectionDbService } from '../../backend/modules/section/section-db-service';
import { createGetServerSideProps } from '../../utils/create-get-ssr-props';
import MyInterviewsPage from '../../controllers/MyInterviewsPage';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ session }) => {
        const completedSections = await sectionDbService.findAllInterviewerSections(session.user.id, true);
        const onGoingSections = await sectionDbService.findAllInterviewerSections(session.user.id, false);

        return { completedSections, onGoingSections };
    },
});

export default MyInterviewsPage;
