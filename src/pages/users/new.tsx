import { accessChecks } from '../../backend/access/access-checks';
import { LayoutMain } from '../../components/layout/LayoutMain';
import { NewUserForm } from '../../components/users/NewUserForm';
import { createGetServerSideProps } from '../../utils/create-get-ssr-props';

import { tr } from './users.i18n';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ session, handleAccessChecks }) => {
        await handleAccessChecks(() => accessChecks.user.create(session));
    },
});

const NewUserPage = () => {
    return (
        <LayoutMain pageTitle={tr('New user')}>
            <NewUserForm />
        </LayoutMain>
    );
};

export default NewUserPage;
