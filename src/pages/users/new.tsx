import { accessChecks } from '../../backend/access/access-checks';
import NewUserPage from '../../controllers/NewUserPage';
import { createGetServerSideProps } from '../../utils/create-get-ssr-props';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ session, handleAccessChecks }) => {
        await handleAccessChecks(() => accessChecks.user.create(session));
    },
});

export default NewUserPage;
