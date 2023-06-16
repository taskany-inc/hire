import { accessChecks } from '../backend/access/access-checks';
import { LayoutMain } from '../components/layout/LayoutMain';
import { Roles } from '../components/roles/Roles';
import { createGetServerSideProps } from '../utils/create-get-ssr-props';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ session, handleAccessChecks }) => {
        await handleAccessChecks(() => accessChecks.roles.readPage(session));
    },
});

export default function UserRolesPage() {
    return (
        <LayoutMain pageTitle="Users roles">
            <Roles />
        </LayoutMain>
    );
}
