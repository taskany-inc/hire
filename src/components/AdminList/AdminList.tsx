import { useAdminsList } from '../../modules/rolesHooks';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { UserList } from '../UserList/UserList';

import { tr } from './AdminList.i18n';

export const AdminsList = () => {
    const adminsListQuery = useAdminsList();

    return (
        <QueryResolver queries={[adminsListQuery]}>
            {([admins]) => <UserList title={tr('Administrators')} users={admins} />}
        </QueryResolver>
    );
};
