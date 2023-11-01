import { UserSettingsPage } from '../../components/settings/UserSettingsPage';
import { createGetServerSideProps } from '../../utils/create-get-ssr-props';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ session, ssg }) => {
        await ssg.users.getById.fetch(session.user.id);
        return { userId: session.user.id };
    },
});

export default UserSettingsPage;
