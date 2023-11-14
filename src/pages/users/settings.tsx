import { UserSettingsPage } from '../../components/UserSettingsPage/UserSettingsPage';
import { createGetServerSideProps } from '../../utils/createGetSSRProps';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ session, ssg }) => {
        await ssg.users.getById.fetch(session.user.id);
        return { userId: session.user.id };
    },
});

export default UserSettingsPage;
