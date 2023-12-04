import UserRolesPage from '../components/RolesPage/UserRolesPage';
import { accessChecks } from '../modules/accessChecks';
import { createGetServerSideProps } from '../utils/createGetSSRProps';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ session, handleAccessChecks }) => {
        await handleAccessChecks(() => accessChecks.roles.readPage(session));
    },
});

export default UserRolesPage;
