import { EditAiAssistant } from '../components/EditAiAssistant/EditAiAssistant';
import { LayoutMain } from '../components/LayoutMain/LayoutMain';
import { createGetServerSideProps } from '../utils/createGetSSRProps';
import { tr } from '../components/EditAiAssistant/EditAiAssistant.i18n';

const AiAssistantPage = () => {
    return (
        <LayoutMain pageTitle={tr('AI assistant')}>
            <EditAiAssistant />
        </LayoutMain>
    );
};

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ session, ssg }) => {
        if (!session.user.admin) {
            return {
                redirect: {
                    destination: '/',
                },
            };
        }

        await ssg.appConfig.get.prefetch();
        await ssg.aiAssistant.getAllAiAssistants.prefetch();
        await ssg.aiAssistant.getAllOptionTypes.prefetch();

        return {};
    },
});

export default AiAssistantPage;
