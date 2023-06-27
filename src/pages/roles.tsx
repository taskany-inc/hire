import { accessChecks } from '../backend/access/access-checks';
import UserRolesPage from '../controllers/UserRolesPage';
import { createGetServerSideProps } from '../utils/create-get-ssr-props';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ session, handleAccessChecks }) => {
        await handleAccessChecks(() => accessChecks.roles.readPage(session));
    },
});

export default UserRolesPage;
