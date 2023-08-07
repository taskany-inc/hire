import { LayoutMain } from '../components/layout/LayoutMain';
import { Roles } from '../components/roles/Roles';

import { tr } from './controllers.i18n';

const UserRolesPage = () => {
    return (
        <LayoutMain pageTitle={tr('Users roles')}>
            <Roles />
        </LayoutMain>
    );
};

export default UserRolesPage;
