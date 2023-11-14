import { accessChecks } from '../../modules/accessChecks';
import NewUserPage from '../../components/NewUserPage/NewUserPage';
import { createGetServerSideProps } from '../../utils/createGetSSRProps';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ session, handleAccessChecks }) => {
        await handleAccessChecks(() => accessChecks.user.create(session));
    },
});

export default NewUserPage;
